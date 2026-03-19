# 🔋 WattWise

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/HewageNKM/wattwise-rust)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Ubuntu Support](https://img.shields.io/badge/Ubuntu-22.04%20%7C%2024.04-orange)](https://ubuntu.com)

**WattWise** is a premium, high-performance Linux power management suite engineered with **Rust** and **Tauri 2.0**. It represents the next generation of Linux CPU optimization, aiming for a professional "macOS-level" efficiency experience on open-source distributions.

---

## 🚀 Key Features

-   **⚡ Rust-Powered Engine**: ultra-lightweight daemon with direct, safe kernel interactions for minimal CPU overhead.
-   **📊 Real-time Analytics**: Premium Tauri-based interface featuring live frequency tracking, process resource monitoring, and AI-driven efficiency advice.
-   **🔋 Advanced Battery Control**: Native support for high-precision charge thresholds across major vendors (ASUS, IdeaPad, ThinkPad, LG Gram).
-   **🎯 Intelligent Autopilot**: Adaptive scaling heuristics that balance peak performance and silent efficiency based on real-time load and thermal state.
-   **🛡️ Universal Ubuntu Support**: Optimized for modern Ubuntu releases (22.04 LTS and 24.04 LTS) with seamless systemd integration.

---

## 📦 Installation (Universal Ubuntu)

### 1. Download the Latest Release
Grab the latest `.deb` package from the [GitHub Releases](https://github.com/HewageNKM/wattwise-rust/releases) page.

### 2. Install via Terminal
```bash
sudo dpkg -i wattwise_1.0.0_amd64.deb
sudo apt-get install -f  # Fix any missing dependencies
```

### 3. Management
The background daemon starts automatically. You can manage it with:
```bash
sudo systemctl status wattwise.service
```

---

## 🛠️ Development & Building

### Prerequisites
-   **Rust 1.75+**
-   **Node.js 18+**
-   **System Libs**: `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`

### Setup
1. Clone the repo: `git clone https://github.com/HewageNKM/wattwise-rust.git`
2. Install dependencies: `npm install`
3. Run dev mode: `npm run tauri dev`

---

## 🤝 Credits
Built on the robust foundations of the **auto-cpufreq** project. We honor the legacy power-saving logic while providing a completely new high-performance implementation.

---

## ⚖️ License
Distributed under the **MIT License**. See `LICENSE` for more information.
