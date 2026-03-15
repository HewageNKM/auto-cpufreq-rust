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
                    {activeGov && <p style={{fontSize: '10px', color: 'var(--success)', marginTop: '8px'}}>Override Active: {activeGov}</p>}
                </div>

                <div className="glass-card settings-group">
                    <h3>Turbo Boost Intel/AMD</h3>
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
                    {turboEnabled !== undefined && <p style={{fontSize: '10px', color: 'var(--success)', marginTop: '8px'}}>Manual Lock: {turboEnabled ? 'ON' : 'OFF'}</p>}
                </div>
            </div>
            
            <div className="side-pane glass-card">
                <div className="label">Engine Settings</div>
                <div className="mini-stat" style={{ margin: '12px 0' }}>
                    <span>Auto-Start</span>
                    <input type="checkbox" defaultChecked />
                </div>
            </div>
        </div>
    );
};
