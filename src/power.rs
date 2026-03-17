use std::fs;
use std::path::Path;
use std::sync::atomic::{AtomicU32, AtomicBool, AtomicUsize, Ordering};
use std::sync::Mutex;
use std::time::{Duration, Instant};

// --- Configuration Constants ---
const LOW_LOAD_THRESHOLD_TICKS: usize = 12; 
const THERMAL_CUTOFF_CELSIUS: f32 = 72.0; 
const CORE_MINIMUM: usize = 2;              
const TURBO_SUSTAIN_SEC: u64 = 5;           

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Tier { Eco, Balanced, Performance, Extreme }

pub enum EnergyPreference { Performance, BalancePerformance, BalancePower, Power }

impl EnergyPreference {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Performance => "performance",
            Self::BalancePerformance => "balance_performance",
            Self::BalancePower => "balance_power",
            Self::Power => "power",
        }
    }
}

pub struct PowerManager {
    total_cores: usize,
    prev_cpu_usage: AtomicU32,
    rolling_load_avg: AtomicU32,
    
    current_tier: Mutex<Tier>,
    last_transition: Mutex<Instant>,
    last_park_event: Mutex<Instant>,
    last_high_load: Mutex<Instant>, 
    
    low_load_ticks: AtomicUsize,
    current_unpark_count: AtomicUsize,
}

impl PowerManager {
    pub fn new() -> Self {
        // Robust core detection for mobile/multisocket
        let cores = fs::read_dir("/sys/devices/system/cpu")
            .map(|entries| entries.flatten()
                .filter(|e| {
                    let name = e.file_name().to_string_lossy().into_owned();
                    name.starts_with("cpu") && name[3..].chars().all(|c| c.is_ascii_digit())
                })
                .count())
            .unwrap_or(4);

        Self {
            total_cores: cores,
            prev_cpu_usage: AtomicU32::new(0),
            rolling_load_avg: AtomicU32::new(0),
            current_tier: Mutex::new(Tier::Balanced),
            last_transition: Mutex::new(Instant::now()),
            last_park_event: Mutex::new(Instant::now()),
            last_high_load: Mutex::new(Instant::now()),
            low_load_ticks: AtomicUsize::new(0),
            current_unpark_count: AtomicUsize::new(cores),
        }
    }

    fn safe_write(&self, path: &str, value: &str) -> Result<(), String> {
        let p = Path::new(path);
        if !p.exists() { return Ok(()); }
        
        // Mobile CPUs often have restricted write permissions on some nodes
        if let Ok(current) = fs::read_to_string(path) {
            if current.trim() == value { return Ok(()); }
        }
        
        fs::write(path, value).map_err(|e| format!("Path {}: {}", path, e))
    }

    pub fn handle_state_change(&self, metrics: &crate::monitor::SystemMetrics) -> Duration {
        let now = Instant::now();
        let cpu_usage = metrics.total_cpu_usage;
        let cpu_temp = metrics.cpu_temperature.unwrap_or(0.0);
        
        let alpha = 0.15;
        let prev_avg = f32::from_bits(self.rolling_load_avg.load(Ordering::Relaxed));
        let rolling_avg = (alpha * cpu_usage) + ((1.0 - alpha) * prev_avg);
        self.rolling_load_avg.store(rolling_avg.to_bits(), Ordering::Relaxed);

        if rolling_avg > 40.0 {
            let mut lhl = self.last_high_load.lock().unwrap();
            *lhl = now;
        }

        let mut target_tier = match rolling_avg {
            l if l < 15.0 => Tier::Eco,
            l if l < 45.0 => Tier::Balanced,
            l if l < 80.0 => Tier::Performance,
            _ => Tier::Extreme,
        };

        if cpu_temp > THERMAL_CUTOFF_CELSIUS {
            target_tier = Tier::Eco;
        }

        let mut current_tier_lock = self.current_tier.lock().unwrap();
        let mut last_trans_lock = self.last_transition.lock().unwrap();

        if *current_tier_lock != target_tier && last_trans_lock.elapsed() > Duration::from_secs(2) {
            self.apply_tier_hardware(target_tier);
            *current_tier_lock = target_tier;
            *last_trans_lock = now;
        }

        // Dynamic Core Scaling
        let current_unparked = self.current_unpark_count.load(Ordering::SeqCst);
        let ideal_cores = ((self.total_cores as f32 * (rolling_avg / 100.0)) * 1.35).ceil() as usize;
        let ideal_clamped = ideal_cores.clamp(CORE_MINIMUM, self.total_cores);

        let mut final_core_target = current_unparked;
        if ideal_clamped > current_unparked {
            final_core_target = ideal_clamped;
            self.low_load_ticks.store(0, Ordering::Relaxed);
        } else if ideal_clamped < current_unparked {
            let ticks = self.low_load_ticks.fetch_add(1, Ordering::Relaxed);
            if ticks >= LOW_LOAD_THRESHOLD_TICKS {
                final_core_target = ideal_clamped;
                self.low_load_ticks.store(0, Ordering::Relaxed);
            }
        }

        if final_core_target != current_unparked {
            self.park_cores_safe(final_core_target);
        }

        let state_json = format!(
            "{{\"unpark_count\": {}, \"max_perf_pct\": {}, \"tier\": \"{:?}\"}}",
            final_core_target, 100, target_tier
        );
        let _ = std::fs::write("/run/zenith-energy.state", state_json);

        if target_tier == Tier::Extreme { Duration::from_millis(500) } else { Duration::from_secs(2) }
    }

    pub fn set_usb_autosuspend(&self, _enabled: bool) {}
    pub fn set_sata_alpm(&self, _enabled: bool) {}

    fn park_cores_safe(&self, target: usize) {
        let mut last_park = self.last_park_event.lock().unwrap();
        if last_park.elapsed() < Duration::from_secs(3) { return; }

        for id in 1..self.total_cores {
            let online = id < target;
            let path = format!("/sys/devices/system/cpu/cpu{}/online", id);
            let _ = self.safe_write(&path, if online { "1" } else { "0" });
        }

        self.current_unpark_count.store(target, Ordering::SeqCst);
        *last_park = Instant::now();
    }

    fn apply_tier_hardware(&self, tier: Tier) {
        match tier {
            Tier::Eco => {
                let _ = self.write_to_all_possible("cpufreq/scaling_governor", "powersave");
                let _ = self.write_to_all_possible("cpufreq/energy_performance_preference", EnergyPreference::Power.as_str());
                let _ = self.set_turbo_dynamic(false);
            },
            Tier::Balanced => {
                let _ = self.write_to_all_possible("cpufreq/scaling_governor", "powersave");
                let _ = self.write_to_all_possible("cpufreq/energy_performance_preference", EnergyPreference::BalancePower.as_str());
                let _ = self.set_turbo_dynamic(true);
            },
            Tier::Performance => {
                let _ = self.write_to_all_possible("cpufreq/scaling_governor", "performance");
                let _ = self.write_to_all_possible("cpufreq/energy_performance_preference", EnergyPreference::BalancePerformance.as_str());
                let _ = self.set_turbo_dynamic(true);
            },
            Tier::Extreme => {
                let _ = self.write_to_all_possible("cpufreq/scaling_governor", "performance");
                let _ = self.write_to_all_possible("cpufreq/energy_performance_preference", EnergyPreference::Performance.as_str());
                let _ = self.set_turbo_dynamic(true);
            }
        }
    }

    fn set_turbo_dynamic(&self, request_on: bool) -> Result<(), String> {
        let lhl = self.last_high_load.lock().unwrap();
        let sustained_on = lhl.elapsed() < Duration::from_secs(TURBO_SUSTAIN_SEC);
        let final_state = request_on || sustained_on;

        // Cover all possible Turbo paths (Intel P-State, CPPC, and Legacy)
        let _ = self.safe_write("/sys/devices/system/cpu/intel_pstate/no_turbo", if final_state { "0" } else { "1" });
        let _ = self.safe_write("/sys/devices/system/cpu/cpufreq/boost", if final_state { "1" } else { "0" });
        
        // 11th Gen Mobile specific: Some kernels use this path for global limits
        let _ = self.safe_write("/sys/devices/system/cpu/intel_pstate/max_perf_pct", if final_state { "100" } else { "70" });
        
        Ok(())
    }

    /// Optimized for Mobile: Iterates all available CPU nodes and handles sub-paths safely
    fn write_to_all_possible(&self, subpath: &str, value: &str) -> Result<(), String> {
        let cpu_base = "/sys/devices/system/cpu";
        if let Ok(entries) = fs::read_dir(cpu_base) {
            for entry in entries.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.starts_with("cpu") && name[3..].chars().all(|c| c.is_ascii_digit()) {
                    let full_path = format!("{}/{}/{}", cpu_base, name, subpath);
                    let _ = self.safe_write(&full_path, value);
                }
            }
        }
        Ok(())
    }
}