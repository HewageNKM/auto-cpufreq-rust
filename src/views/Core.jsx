import { invoke } from "@tauri-apps/api/core";

export const Core = ({ metrics, notify }) => {
    const activeGov = metrics.config.governor_override;
    const turboEnabled = metrics.config.turbo_override;

    const setGovernor = (gov) => {
        invoke("set_governor", { governor: gov })
            .then(() => notify(`Power mode set to ${gov}`))
            .catch(console.error);
    };

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
                    <div className="action-row">
                        <button 
                            className={activeGov === "performance" ? "btn-primary" : "btn-secondary"} 
                            onClick={() => setGovernor("performance")}
                        >Performance</button>
                        <button 
                            className={activeGov === "powersave" ? "btn-primary" : "btn-secondary"} 
                            onClick={() => setGovernor("powersave")}
                        >Efficiency</button>
                        <button 
                            className={activeGov === "schedutil" ? "btn-primary" : "btn-secondary"} 
                            onClick={() => setGovernor("schedutil")}
                        >Balanced</button>
                    </div>
                    {activeGov && <p style={{fontSize: '10px', color: 'var(--success)', marginTop: '8px'}}>Manual Override: {activeGov.toUpperCase()}</p>}
                    <div style={{marginTop: '12px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '11px'}}>
                        <strong>Note:</strong> 
                        {activeGov === "performance" && " Forced high frequency for maximum responsiveness. Fans may increase."}
                        {activeGov === "powersave" && " Aggressive clock scaling for maximum battery endurance."}
                        {activeGov === "schedutil" && " Dynamic scaling based on kernel scheduler load."}
                        {!activeGov && " Auto-pilot active. The engine dynamically fluctuates based on AC/DC state."}
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
