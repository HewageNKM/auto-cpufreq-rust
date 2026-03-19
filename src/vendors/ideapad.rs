use crate::battery::{BatteryProvider, BatteryStats};
use std::fs;
use std::path::Path;

pub struct IdeaPadBattery;

const CONSERVATION_MODE_PATH: &str = "/sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode";

impl IdeaPadBattery {
    pub fn new() -> Self {
        Self
    }

    fn read_sysfs(&self, path: &str) -> Option<String> {
        fs::read_to_string(path).ok().map(|s| s.trim().to_string())
    }

    fn write_sysfs(&self, path: &str, value: &str) -> Result<(), String> {
        fs::write(path, value).map_err(|e| format!("Failed to write to {}: {}", path, e))
    }
}

impl BatteryProvider for IdeaPadBattery {
    fn get_stats(&self) -> Result<BatteryStats, String> {
        let bat_path = "/sys/class/power_supply/BAT0";
        if !Path::new(bat_path).exists() {
            return Err("No battery found at BAT0".to_string());
        }

        let level = self.read_sysfs(&format!("{}/capacity", bat_path))
            .and_then(|s| s.parse::<f32>().ok())
            .unwrap_or(0.0);

        let status = self.read_sysfs(&format!("{}/status", bat_path))
            .unwrap_or_else(|| "Unknown".to_string());

        let conservation = self.read_sysfs(CONSERVATION_MODE_PATH)
            .map(|s| s == "1")
            .unwrap_or(false);

        let energy_full = self.read_sysfs(&format!("{}/energy_full", bat_path))
            .and_then(|s| s.parse::<f32>().ok().map(|e| e / 1_000_000.0));
        let energy_now = self.read_sysfs(&format!("{}/energy_now", bat_path))
            .and_then(|s| s.parse::<f32>().ok().map(|e| e / 1_000_000.0));
        let energy_full_design = self.read_sysfs(&format!("{}/energy_full_design", bat_path))
            .and_then(|s| s.parse::<f32>().ok().map(|e| e / 1_000_000.0));
        let power_now = self.read_sysfs(&format!("{}/power_now", bat_path))
            .and_then(|s| s.parse::<f32>().ok().map(|p| p / 1_000_000.0));
        let cycle_count = self.read_sysfs(&format!("{}/cycle_count", bat_path))
            .and_then(|s| s.parse::<u32>().ok());
        let voltage_now = self.read_sysfs(&format!("{}/voltage_now", bat_path))
            .and_then(|s| s.parse::<f32>().ok().map(|v| v / 1_000_000.0));
        let current_now = self.read_sysfs(&format!("{}/current_now", bat_path))
            .and_then(|s| s.parse::<f32>().ok().map(|i| i / 1_000_000.0));
        let capacity_design = self.read_sysfs(&format!("{}/energy_full_design", bat_path))
            .or_else(|| self.read_sysfs(&format!("{}/charge_full_design", bat_path)))
            .and_then(|s| s.parse::<f32>().ok().map(|c| c / 1_000_000.0));
        let capacity_full = self.read_sysfs(&format!("{}/energy_full", bat_path))
            .or_else(|| self.read_sysfs(&format!("{}/charge_full", bat_path)))
            .and_then(|s| s.parse::<f32>().ok().map(|c| c / 1_000_000.0));

        let manufacturer = self.read_sysfs(&format!("{}/manufacturer", bat_path));
        let serial_number = self.read_sysfs(&format!("{}/serial_number", bat_path));
        let model_name = self.read_sysfs(&format!("{}/model_name", bat_path));
        let technology = self.read_sysfs(&format!("{}/technology", bat_path));

        let health = if let (Some(full), Some(design)) = (capacity_full, capacity_design) {
            Some((full / design) * 100.0)
        } else {
            None
        };

        let time_remaining = if let (Some(now), Some(power), is_charging) = (energy_now, power_now, status == "Charging") {
            if power > 0.0 {
                if is_charging && energy_full.is_some() {
                    Some((energy_full.unwrap() - now) / power)
                } else if !is_charging {
                    Some(now / power)
                } else {
                    None
                }
            } else {
                None
            }
        } else {
            None
        };

        Ok(BatteryStats {
            level,
            is_charging: status != "Discharging",
            start_threshold: None,
            stop_threshold: if conservation { Some(60) } else { Some(100) },
            vendor: "IdeaPad".to_string(),
            health,
            cycle_count,
            energy_full,
            energy_full_design,
            power_now,
            time_remaining,
            voltage_now,
            current_now,
            capacity_design,
            capacity_full,
            manufacturer,
            serial_number,
            model_name,
            technology,
        })
    }

    fn set_thresholds(&self, _start: u8, stop: u8) -> Result<(), String> {
        // IdeaPad conservation mode is typically 60%
        let value = if stop <= 60 { "1" } else { "0" };
        self.write_sysfs(CONSERVATION_MODE_PATH, value)
    }
}
