use crate::battery::{BatteryProvider, BatteryStats};
use std::fs;
use std::path::Path;

pub struct AppleBattery;

impl AppleBattery {
    pub fn new() -> Self {
        Self
    }

    fn read_sysfs(&self, path: &str) -> Option<String> {
        fs::read_to_string(path).ok().map(|s| s.trim().to_string())
    }
}

impl BatteryProvider for AppleBattery {
    fn get_stats(&self) -> Result<BatteryStats, String> {
        // Apple Silicon Linux typically uses macsmc-battery
        let bat_path = "/sys/class/power_supply/macsmc-battery";
        if !Path::new(bat_path).exists() {
            return Err("No Apple battery found".to_string());
        }

        let level = self.read_sysfs(&format!("{}/capacity", bat_path))
            .and_then(|s| s.parse::<f32>().ok())
            .unwrap_or(0.0);

        let status = self.read_sysfs(&format!("{}/status", bat_path))
            .unwrap_or_else(|| "Unknown".to_string());

        let energy_full = self.read_sysfs(&format!("{}/energy_full", bat_path))
            .and_then(|s| s.parse::<f32>().ok().map(|e| e / 1_000_000.0));
        let _energy_now = self.read_sysfs(&format!("{}/energy_now", bat_path))
            .and_then(|s| s.parse::<f32>().ok());
        let cycle_count = self.read_sysfs(&format!("{}/cycle_count", bat_path))
            .and_then(|s| s.parse::<u32>().ok());

        let manufacturer = self.read_sysfs(&format!("{}/manufacturer", bat_path));
        let serial_number = self.read_sysfs(&format!("{}/serial_number", bat_path));
        let model_name = self.read_sysfs(&format!("{}/model_name", bat_path));
        let technology = self.read_sysfs(&format!("{}/technology", bat_path));

        Ok(BatteryStats {
            level,
            is_charging: status != "Discharging",
            start_threshold: None,
            stop_threshold: None, // Asahi threshold support is wip or via different smc keys
            vendor: "Apple Silicon".to_string(),
            health: None, // TODO
            cycle_count,
            energy_full,
            energy_full_design: None,
            power_now: None,
            time_remaining: None,
            voltage_now: None,
            current_now: None,
            capacity_design: None,
            capacity_full: None,
            manufacturer,
            serial_number,
            model_name,
            technology,
        })
    }

    fn set_thresholds(&self, _start: u8, _stop: u8) -> Result<(), String> {
        Err("Thresholds not yet supported for Apple Silicon".to_string())
    }
}
