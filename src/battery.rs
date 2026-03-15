use serde::{Serialize, Deserialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BatteryStats {
    pub level: f32,
    pub is_charging: bool,
    pub start_threshold: Option<u8>,
    pub stop_threshold: Option<u8>,
    pub vendor: String,
    pub health: Option<f32>,
    pub cycle_count: Option<u32>,
    pub energy_full: Option<f32>,
    pub energy_full_design: Option<f32>,
    pub power_now: Option<f32>,
    pub time_remaining: Option<f32>, // in hours
    pub voltage_now: Option<f32>,    // in Volts
    pub current_now: Option<f32>,    // in Amperes
    pub capacity_design: Option<f32>, // in mAh or mWh
    pub capacity_full: Option<f32>,   // in mAh or mWh
}

pub trait BatteryProvider: Send + Sync {
    fn get_stats(&self) -> Result<BatteryStats, String>;
    fn set_thresholds(&self, start: u8, stop: u8) -> Result<(), String>;
}

pub fn get_vendor_battery() -> Box<dyn BatteryProvider> {
    use crate::vendors::asus::AsusBattery;
    use crate::vendors::ideapad::IdeaPadBattery;
    use crate::vendors::thinkpad::ThinkPadBattery;
    use crate::vendors::gram::GramBattery;
    use crate::vendors::apple::AppleBattery;

    // Discovery Logic
    if Path::new("/sys/class/power_supply/BAT0/charge_control_end_threshold").exists() {
        // Modern standard (ThinkPad, Asus, Samsung)
        if fs::read_to_string("/sys/class/dmi/id/chassis_vendor").ok().map(|s| s.contains("ASUSTeK")).unwrap_or(false) {
             return Box::new(AsusBattery::new());
        }
        return Box::new(ThinkPadBattery::new());
    }

    if Path::new("/sys/bus/platform/drivers/ideapad_acpi").exists() {
        return Box::new(IdeaPadBattery::new());
    }

    if Path::new("/sys/devices/platform/lg-laptop").exists() {
        return Box::new(GramBattery::new());
    }

    if Path::new("/sys/class/power_supply/macsmc-battery").exists() {
        return Box::new(AppleBattery::new());
    }

    Box::new(GenericLinuxBattery::new())
}

pub struct GenericLinuxBattery;

impl GenericLinuxBattery {
    pub fn new() -> Self {
        Self
    }

    fn read_sysfs(&self, path: &str) -> Option<String> {
        fs::read_to_string(path).ok().map(|s| s.trim().to_string())
    }
}

impl BatteryProvider for GenericLinuxBattery {
    fn get_stats(&self) -> Result<BatteryStats, String> {
        // Basic Linux implementation via /sys/class/power_supply/BAT0/
        let bat_path = "/sys/class/power_supply/BAT0";
        if !Path::new(bat_path).exists() {
            return Err("No battery found at BAT0".to_string());
        }

        let level = self.read_sysfs(&format!("{}/capacity", bat_path))
            .and_then(|s| s.parse::<f32>().ok())
            .unwrap_or(0.0);

        let status = self.read_sysfs(&format!("{}/status", bat_path))
            .unwrap_or_else(|| "Unknown".to_string());

        let energy_full = self.read_sysfs(&format!("{}/energy_full", bat_path))
            .and_then(|s| s.parse::<f32>().ok());
        let energy_now = self.read_sysfs(&format!("{}/energy_now", bat_path))
            .and_then(|s| s.parse::<f32>().ok());
        let energy_full_design = self.read_sysfs(&format!("{}/energy_full_design", bat_path))
            .and_then(|s| s.parse::<f32>().ok());
        let power_now = self.read_sysfs(&format!("{}/power_now", bat_path))
            .and_then(|s| s.parse::<f32>().ok());
        let cycle_count = self.read_sysfs(&format!("{}/cycle_count", bat_path))
            .and_then(|s| s.parse::<u32>().ok());
        let voltage_now = self.read_sysfs(&format!("{}/voltage_now", bat_path))
            .and_then(|s| s.parse::<f32>().ok().map(|v| v / 1_000_000.0));
        let current_now = self.read_sysfs(&format!("{}/current_now", bat_path))
            .and_then(|s| s.parse::<f32>().ok().map(|i| i / 1_000_000.0));
        let capacity_design = self.read_sysfs(&format!("{}/energy_full_design", bat_path))
            .or_else(|| self.read_sysfs(&format!("{}/charge_full_design", bat_path)))
            .and_then(|s| s.parse::<f32>().ok());
        let capacity_full = self.read_sysfs(&format!("{}/energy_full", bat_path))
            .or_else(|| self.read_sysfs(&format!("{}/charge_full", bat_path)))
            .and_then(|s| s.parse::<f32>().ok());

        let health = if let (Some(full), Some(design)) = (energy_full, energy_full_design) {
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
            is_charging: status == "Charging",
            start_threshold: None,
            stop_threshold: None,
            vendor: "Generic Linux".to_string(),
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
        })
    }

    fn set_thresholds(&self, _start: u8, _stop: u8) -> Result<(), String> {
        Err("Thresholds not supported by generic driver".to_string())
    }
}
