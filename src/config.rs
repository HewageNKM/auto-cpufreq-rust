use serde::{Serialize, Deserialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PowerProfile {
    pub governor: String,
    pub turbo: bool,
    pub core_parking: bool,
    pub usb_autosuspend: bool,
    pub sata_alpm: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub ac_profile: PowerProfile,
    pub bat_profile: PowerProfile,
    pub manual_override: Option<String>, // "performance", "efficiency", None (Auto)
    pub battery_threshold: u8,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            ac_profile: PowerProfile {
                governor: "performance".to_string(),
                turbo: true,
                core_parking: false,
                usb_autosuspend: false,
                sata_alpm: false,
            },
            bat_profile: PowerProfile {
                governor: "powersave".to_string(),
                turbo: false,
                core_parking: true,
                usb_autosuspend: true,
                sata_alpm: true,
            },
            manual_override: None,
            battery_threshold: 80,
        }
    }
}

impl AppConfig {
    fn get_path() -> PathBuf {
        let mut path = PathBuf::from("/etc/zenith-energy");
        if !path.exists() {
            let _ = fs::create_dir_all(&path);
        }
        path.push("config.json");
        path
    }

    pub fn load() -> Self {
        let path = Self::get_path();
        if let Ok(content) = fs::read_to_string(path) {
            serde_json::from_str(&content).unwrap_or_default()
        } else {
            Self::default()
        }
    }

    pub fn save(&self) -> Result<(), String> {
        let path = Self::get_path();
        let content = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        fs::write(path, content).map_err(|e| e.to_string())
    }
}
