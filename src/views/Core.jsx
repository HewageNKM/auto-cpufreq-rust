import { invoke } from "@tauri-apps/api/core";

export const Core = ({ metrics, notify }) => {
    const turboEnabled = metrics.config?.ac_profile?.turbo;

    const setTurbo = (enabled) => {
        invoke("set_turbo", { enabled })
            .then(() => notify(`Turbo Boost ${enabled ? 'Unlocked' : 'Locked'}`))
            .catch(console.error);
    };

    return (
        <div className="page-layout">
            <div className="main-pane">
                <div className="glass-card settings-group">
                    <h3>Global Power Heuristics</h3>
                    <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px'}}>
                        Configure how the system prioritizes energy consumption vs computational throughput.
                    </p>
                    <div className="action-row" style={{gap: '8px', display: 'flex', flexWrap: 'wrap'}}>
                        <button 
                            className={!metrics.config?.manual_override ? "btn-primary" : "btn-secondary"} 
                            onClick={() => invoke("set_operation_mode", { mode: "auto" }).then(() => notify("Switched to Auto-Pilot (AI)")).catch(console.error)}
                            style={{flex: '1', fontSize: '12px', padding: '10px'}}
                        >🤖 Auto-Pilot</button>
                        <button 
                            className={metrics.config?.manual_override === "performance" ? "btn-primary" : "btn-secondary"} 
                            onClick={() => invoke("set_operation_mode", { mode: "performance" }).then(() => notify("Always Performance Locked")).catch(console.error)}
                            style={{flex: '1', fontSize: '12px', padding: '10px'}}
                        >⚡ Performance</button>
                        <button 
                            className={metrics.config?.manual_override === "efficiency" ? "btn-primary" : "btn-secondary"} 
                            onClick={() => invoke("set_operation_mode", { mode: "efficiency" }).then(() => notify("Always Efficiency Locked")).catch(console.error)}
                            style={{flex: '1', fontSize: '12px', padding: '10px'}}
                        >🔋 Efficiency</button>
                    </div>
                    {metrics.config?.manual_override && <p style={{fontSize: '10px', color: 'var(--success)', marginTop: '8px'}}>Manual Override: {metrics.config?.manual_override.toUpperCase()}</p>}
                    <div style={{marginTop: '12px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '11px'}}>
                        <strong>Note:</strong> 
                        {metrics.config?.manual_override === "performance" && " Forces AC high-performance profiles strictly, ignoring cable sensors."}
                        {metrics.config?.manual_override === "efficiency" && " Forces Battery deep powersave profiles strictly on all dimensions."}
                        {(!metrics.config?.manual_override) && " Dynamic auto-switching presets accurately based on active power source."}
                    </div>
                </div>

                <div className="glass-card settings-group">
                    <h3>Turbo Boost Intel/AMD</h3>
                    <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px'}}>
                        Unlock the processor's capability to exceed its base clock frequency.
                    </p>
                    <div className="action-row">
                        <button 
                            className={turboEnabled === true ? "btn-primary" : "btn-secondary"} 
                            onClick={() => setTurbo(true)}
                        >Unlock Potential</button>
                        <button 
                            className={turboEnabled === false ? "btn-primary" : "btn-secondary"} 
                            onClick={() => setTurbo(false)}
                        >Lock Frequencies</button>
                    </div>
                    {turboEnabled !== undefined && <p style={{fontSize: '10px', color: 'var(--success)', marginTop: '8px'}}>Manual Lock: {turboEnabled ? 'UNLOCKED' : 'LOCKED'}</p>}
                    <div style={{marginTop: '12px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '11px'}}>
                        <strong>Advice:</strong> Disabling Turbo significantly reduces heat generation and can prevent thermal throttling during long operations.
                    </div>
                </div>

                <div className="glass-card settings-group" style={{marginTop: '20px'}}>
                    <h3>Advanced Peripheral Savers</h3>
                    <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px'}}>
                        Control absolute passive energy-drop loops for peripherals.
                    </p>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px'}}>
                            <div>
                                <div style={{fontSize: '13px', fontWeight: '600'}}>USB Autosuspend</div>
                                <div style={{fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px'}}>Power down idle USB ports to save wattage.</div>
                            </div>
                            <button 
                                className={metrics.config?.usb_autosuspend === true ? "btn-primary" : "btn-secondary"} 
                                onClick={() => invoke("set_usb_autosuspend", { enabled: !metrics.config?.usb_autosuspend })
                                    .then(() => notify(`USB Autosuspend ${!metrics.config?.usb_autosuspend ? 'Enabled' : 'Disabled'}`))
                                    .catch(console.error)}
                                style={{padding: '6px 16px', fontSize: '12px'}}
                            >{metrics.config?.usb_autosuspend === true ? "Enabled" : "Enable"}</button>
                        </div>

                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px'}}>
                            <div>
                                <div style={{fontSize: '13px', fontWeight: '600'}}>SATA ALPM</div>
                                <div style={{fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px'}}>Aggressive power states for SCSI/SATA storage links.</div>
                            </div>
                            <button 
                                className={metrics.config?.sata_alpm === true ? "btn-primary" : "btn-secondary"} 
                                onClick={() => invoke("set_sata_alpm", { enabled: !metrics.config?.sata_alpm })
                                    .then(() => notify(`SATA ALPM ${!metrics.config?.sata_alpm ? 'Enabled' : 'Disabled'}`))
                                    .catch(console.error)}
                                style={{padding: '6px 16px', fontSize: '12px'}}
                            >{metrics.config?.sata_alpm === true ? "Enabled" : "Enable"}</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="side-pane glass-card">
                <div className="label">Configuration Integrity</div>
                <div style={{marginTop: '16px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6'}}>
                    <p>All settings are persisted to <code>/etc/zenith-energy/config.json</code> and take immediate effect on the background optimization service.</p>
                    <p style={{marginTop: '12px'}}>Manual overrides will prevent the AI from automatically switching modes when you plug/unplug your device.</p>
                </div>
                <div className="settings-group" style={{ marginTop: '24px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Persistence Engine</p>
                    <div style={{fontSize: '10px', color: 'var(--success)'}}>● Service Active</div>
                    <div style={{fontSize: '10px', opacity: 0.6}}>● Authored with Rust</div>
                </div>
            </div>
        </div>
    );
};
