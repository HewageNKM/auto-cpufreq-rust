# 🔋 WattWise

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/HewageNKM/wattwise-rust)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Ubuntu Support](https://img.shields.io/badge/Ubuntu-22.04%20%7C%2024.04-orange)](https://ubuntu.com)

**WattWise** is a high-fidelity Linux power management suite built with **Rust** and **Tauri**. It features an adaptive **Autopilot Engine** for real-time hardware orchestration, advanced telemetry visualizers, and persistent audit logs. 

> [!NOTE]
> **Legacy Attribution**: This project's core power-saving logic is built upon the robust foundations and research of the `auto-cpufreq` library.

---

## 🚀 Key Features

-   **⚡ Rust-Powered Autopilot**: Ultra-lightweight daemon that dynamically parks cores, scales frequencies, and manages SMT/thermal policies with minimal overhead.
-   **🛰️ Intelligent Telemetry**: High-fidelity visualizers including real-time **Discharge Waveforms**, **SMT Hardware Topology** maps, and **Thermal Pressure** indicators.
-   **📜 Persistent Audit Trails**: Structured, rotating physical logs at `/var/log/wattwise.log` that record every engine intervention for full auditability.
-   **🔋 Advanced Battery Control**: Native support for high-precision charge thresholds across major vendors (ASUS, IdeaPad, ThinkPad, LG Gram).
-   **📊 System Efficiency Scoring**: Real-time "A-C" grading of your power-to-performance ratio, helping you optimize workflows.
-   **🛡️ Universal Ubuntu Support**: Optimized for modern Ubuntu releases (22.04 LTS and 24.04 LTS) with seamless systemd integration.

---

## 🏗️ Architecture: Dual-Process Design

WattWise is engineered for performance and reliability using a decoupled architecture:

1.  **Core Pulse (Rust Daemon)**: A high-privilege background process that interacts directly with Linux kernel nodes (`/sys`, `/proc`). It handles atomic state transitions, core parking, and thermal mitigation with near-zero latency.
2.  **Visual Bridge (Tauri GUI)**: A premium React interface that communicates with the daemon via IPC. It provides high-fidelity telemetry without interfering with the daemon's timing-critical optimization loops.
3.  **State IPC**: Real-time coordination is managed through a lightweight memory-mapped state file at `/run/wattwise.state`, ensuring the UI always reflects the actual hardware state.

---

## ⚖️ Comparative Analysis

| Feature | **WattWise** | auto-cpufreq | TLP | Power Profiles Daemon |
| :--- | :--- | :--- | :--- | :--- |
| **Language** | **Rust (Static)** | Python | Shell / Perl | C |
| **Footprint (RAM)**| **~12MB** | ~65MB | ~5MB | ~8MB |
| **Binary Size** | **~8MB** | ~120MB+ (Env) | < 1MB | < 1MB |
| **Response Time** | **< 500ms** | ~2000ms | N/A (Static) | ~1000ms |
| **Heuristics** | **Proactive** | Reactive | Static | Profile-based |
| **Telemetry**| **Live Waveforms**| Text Metrics | Static Output | Basic Status |

---

---

## 📦 Installation (Universal Ubuntu)

### 1. Download the Latest Release
Grab the latest `.deb` package from the [GitHub Releases](https://github.com/HewageNKM/wattwise/releases) page.

### 2. Install via Terminal
```bash
sudo dpkg -i WattWise_1.0.0_amd64.deb
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
Built on the robust research and logic of the **auto-cpufreq** project. WattWise provides a modern, high-performance Rust implementation and a premium GUI for the next generation of Linux power management.

---

## ⚖️ License
Distributed under the **MIT License**. See `LICENSE` for more information.
