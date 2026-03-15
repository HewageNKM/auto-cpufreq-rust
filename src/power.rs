use crate::monitor::SystemMetrics;
use std::process::Command;
use std::fs;
use std::path::Path;

pub enum Governor {
    Performance,
    Powersave,
    Schedutil,
}

pub enum EnergyPreference {
    Performance,
    BalancePerformance,
    BalancePower,
    Power,
}

impl EnergyPreference {
    pub fn as_str(&self) -> &str {
        match self {
            EnergyPreference::Performance => "performance",
            EnergyPreference::BalancePerformance => "balance_performance",
            EnergyPreference::BalancePower => "balance_power",
            EnergyPreference::Power => "power",
        }
    }
}

impl Governor {
    pub fn as_str(&self) -> &str {
        match self {
            Governor::Performance => "performance",
            Governor::Powersave => "powersave",
            Governor::Schedutil => "schedutil",
        }
    }
}

pub struct PowerManager;

impl PowerManager {
    pub fn new() -> Self {
        Self
    }

    fn write_sysfs(&self, path: &str, value: &str) -> Result<(), String> {
        fs::write(path, value).map_err(|e| format!("Failed to write to {}: {}", path, e))
    }

    fn write_to_all_cpus(&self, subpath: &str, value: &str) -> Result<(), String> {
        let mut errors = Vec::new();
        let cpu_dir = "/sys/devices/system/cpu";
        
        if let Ok(entries) = fs::read_dir(cpu_dir) {
            for entry in entries.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.starts_with("cpu") && name[3..].chars().all(|c| c.is_ascii_digit()) {
                    let full_path = format!("{}/{}/{}", cpu_dir, name, subpath);
                    if Path::new(&full_path).exists() {
                        if let Err(e) = self.write_sysfs(&full_path, value) {
                            errors.push(format!("{}: {}", name, e));
                        }
                    }
                }
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors.join("; "))
        }
    }

    pub fn apply_governor(&self, governor: Governor) -> Result<(), String> {
        let val = governor.as_str();
        // Try native first
        if self.write_to_all_cpus("cpufreq/scaling_governor", val).is_ok() {
            return Ok(());
        }

        // Fallback to cpufreqctl
        let status = Command::new("zenith-ctl")
            .arg("--governor")
            .arg(format!("--set={}", val))
            .status()
            .map_err(|e| e.to_string())?;

        if status.success() {
            Ok(())
        } else {
            Err("Failed to set governor".to_string())
        }
    }

    pub fn apply_epp(&self, preference: EnergyPreference) -> Result<(), String> {
        let val = preference.as_str();
        // Try native first
        if self.write_to_all_cpus("cpufreq/energy_performance_preference", val).is_ok() {
            return Ok(());
        }

        let status = Command::new("zenith-ctl")
            .arg("--epp")
            .arg(format!("--set={}", val))
            .status()
            .map_err(|e| e.to_string())?;

        if status.success() {
            Ok(())
        } else {
            Err("Failed to set EPP".to_string())
        }
    }

    pub fn apply_epb(&self, value: u8) -> Result<(), String> {
        let val = value.to_string();
        // Try native first (often at /sys/devices/system/cpu/cpu*/power/energy_perf_bias)
        if self.write_to_all_cpus("power/energy_perf_bias", &val).is_ok() {
            return Ok(());
        }

        let status = Command::new("zenith-ctl")
            .arg("--epb")
            .arg(format!("--set={}", value))
            .status()
            .map_err(|e| e.to_string())?;

        if status.success() {
            Ok(())
        } else {
            Err("Failed to set EPB".to_string())
        }
    }

    pub fn set_turbo(&self, enabled: bool) -> Result<(), String> {
        // Try native Intel first
        let intel_path = "/sys/devices/system/cpu/intel_pstate/no_turbo";
        let turbo_val = if enabled { "0" } else { "1" };
        if Path::new(intel_path).exists() {
            if self.write_sysfs(intel_path, turbo_val).is_ok() {
                return Ok(());
            }
        }

        // Try native AMD/Other
        let boost_path = "/sys/devices/system/cpu/cpufreq/boost";
        let boost_val = if enabled { "1" } else { "0" };
        if Path::new(boost_path).exists() {
            if self.write_sysfs(boost_path, boost_val).is_ok() {
                return Ok(());
            }
        }

        // Fallback
        let cmd_val = if enabled { "0" } else { "1" };
        let status = Command::new("zenith-ctl")
            .arg("--no-turbo")
            .arg(format!("--set={}", cmd_val))
            .status()
            .map_err(|e| e.to_string())?;

        if status.success() {
            Ok(())
        } else {
            Err("Failed to set turbo mode".to_string())
        }
    }

    pub fn handle_state_change(&self, metrics: &SystemMetrics) {
        if let Some(true) = metrics.is_charging {
            // Charging: Max performance
            let _ = self.apply_governor(Governor::Performance);
            let _ = self.apply_epp(EnergyPreference::Performance);
            let _ = self.apply_epb(0);
            let _ = self.set_turbo(true);
        } else {
            // Battery: Intelligent scaling (macOS-like heuristics)
            let battery_level = metrics.battery_level.unwrap_or(100.0);
            
            if battery_level > 20.0 {
                // Normal battery use
                if metrics.total_cpu_usage > 50.0 {
                    let _ = self.apply_governor(Governor::Schedutil);
                    let _ = self.apply_epp(EnergyPreference::BalancePerformance);
                    let _ = self.apply_epb(6);
                    let _ = self.set_turbo(metrics.total_cpu_usage > 90.0);
                } else {
                    let _ = self.apply_governor(Governor::Powersave);
                    let _ = self.apply_epp(EnergyPreference::BalancePower);
                    let _ = self.apply_epb(10);
                    let _ = self.set_turbo(false);
                }
            } else {
                // Aggressive power saving below 20%
                let _ = self.apply_governor(Governor::Powersave);
                let _ = self.apply_epp(EnergyPreference::Power);
                let _ = self.apply_epb(15);
                let _ = self.set_turbo(false);
            }
        }
    }
}
