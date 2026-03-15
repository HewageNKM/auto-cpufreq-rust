use sysinfo::{System, RefreshKind, CpuRefreshKind, MemoryRefreshKind};
use serde::{Serialize, Deserialize};
use crate::battery::{self};
use crate::config::AppConfig;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CpuCoreInfo {
    pub id: usize,
    pub usage: f32,
    pub frequency: u64,
    pub temperature: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemMetrics {
    pub total_cpu_usage: f32,
    pub cores: Vec<CpuCoreInfo>,
    pub load_avg: (f64, f64, f64),
    pub uptime: u64,
    pub memory_used: u64,
    pub memory_total: u64,
    pub disk_usage: f32,
    pub battery_level: Option<f32>,
    pub is_charging: Option<bool>,
    pub battery_health: Option<f32>,
    pub battery_cycles: Option<u32>,
    pub battery_time_remaining: Option<f32>,
    pub battery_vendor: String,
    pub battery_voltage: Option<f32>,
    pub battery_current: Option<f32>,
    pub battery_capacity_design: Option<f32>,
    pub battery_capacity_full: Option<f32>,
    pub config: AppConfig,
}

pub struct Monitor {
    sys: System,
}

impl Monitor {
    pub fn new() -> Self {
        let mut sys = System::new_with_specifics(
            RefreshKind::new()
                .with_cpu(CpuRefreshKind::everything())
                .with_memory(MemoryRefreshKind::everything())
        );
        sys.refresh_all();
        Self { sys }
    }

    pub fn get_metrics(&mut self) -> SystemMetrics {
        self.sys.refresh_cpu();
        self.sys.refresh_memory();

        let cores = self.sys.cpus().iter().enumerate().map(|(id, cpu)| {
            CpuCoreInfo {
                id,
                usage: cpu.cpu_usage(),
                frequency: cpu.frequency(),
                temperature: None,
            }
        }).collect();

        let load = System::load_average();

        let mut bat_level = None;
        let mut charging = None;
        let mut health = None;
        let mut voltage = None;
        let mut current = None;
        let mut cap_design = None;
        let mut cap_full = None;
        let mut cycles = None;
        let mut time_rem = None;
        let mut vendor = "None".to_string();

        let battery = battery::get_vendor_battery();

        if let Ok(stats) = battery.get_stats() {
            bat_level = Some(stats.level);
            charging = Some(stats.is_charging);
            health = stats.health;
            cycles = stats.cycle_count;
            time_rem = stats.time_remaining;
            vendor = stats.vendor;
            voltage = stats.voltage_now;
            current = stats.current_now;
            cap_design = stats.capacity_design;
            cap_full = stats.capacity_full;
        }

        use std::process::Command;
        let disk_usage = Command::new("df")
            .arg("/")
            .arg("--output=pcent")
            .output()
            .ok()
            .and_then(|o| String::from_utf8_lossy(&o.stdout).lines().nth(1)
                .map(|s| s.trim().trim_end_matches('%').parse::<f32>().unwrap_or(0.0)))
            .unwrap_or(0.0);

        SystemMetrics {
            total_cpu_usage: self.sys.global_cpu_info().cpu_usage(),
            cores,
            load_avg: (load.one, load.five, load.fifteen),
            uptime: System::uptime(),
            memory_used: self.sys.used_memory(),
            memory_total: self.sys.total_memory(),
            disk_usage,
            battery_level: bat_level,
            is_charging: charging,
            battery_health: health,
            battery_cycles: cycles,
            battery_time_remaining: time_rem,
            battery_vendor: vendor,
            battery_voltage: voltage,
            battery_current: current,
            battery_capacity_design: cap_design,
            battery_capacity_full: cap_full,
            config: AppConfig::load(),
        }
    }
}
