import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export const Battery = ({ metrics, formatTime, notify }) => {
  const [threshold, setThreshold] = useState(metrics.stop_threshold || 80);

  const updateThreshold = (val) => {
    setThreshold(val);
    invoke("set_battery_threshold", { start: 0, stop: parseInt(val) })
      .then(() => notify(`Charge limit set to ${val}%`))
      .catch(err => console.error(err));
  };

  const health = metrics.battery_health || 100;

  return (
    <div className="page-layout">
      <div className="main-pane">
        <div className="glass-card" style={{ marginBottom: '24px' }}>
          <div className="label">Energy Reservoir ({metrics.battery_vendor})</div>
          <div className="value" style={{ fontSize: '48px' }}>{metrics.battery_level}%</div>
          <div className="stats-grid" style={{ marginTop: '24px' }}>
            <div className="mini-stat">
              <span className="label">Cell Health</span>
              <span className="val" style={{ color: health > 80 ? 'var(--success)' : 'orange' }}>
                {Math.round(health)}%
              </span>
            </div>
            <div className="mini-stat">
              <span className="label">Cycle Count</span>
              <span className="val">{metrics.battery_cycles || "N/A"}</span>
            </div>
            <div className="mini-stat">
              <span className="label">Predictive Exhaustion</span>
              <span className="val">{formatTime(metrics.battery_time_remaining)}</span>
            </div>
          </div>
        </div>

        <div className="glass-card">
           <div className="label">Charge Limiter (Conservation Mode)</div>
           <div style={{ padding: '20px 0' }}>
              <input 
                type="range" 
                min="60" 
                max="100" 
                step="5" 
                value={threshold} 
                onChange={(e) => updateThreshold(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--brand-accent)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '13px' }}>
                <span>Long Life (60%)</span>
                <span style={{ fontWeight: '800', color: 'var(--brand-accent)' }}>{threshold}%</span>
                <span>Full Charge (100%)</span>
              </div>
           </div>
           <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '12px' }}>
              Restricting the maximum charge level significantly extends the chemical lifespan of your lithium-ion cells.
           </p>
        </div>
      </div>

      <div className="side-pane glass-card">
        <div className="label">Battery Optimization</div>
        <div className="settings-group" style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Quick Presets</p>
          <button className="btn-secondary" style={{ width: '100%', fontSize: '12px', marginBottom: '8px' }} onClick={() => updateThreshold(60)}>Conservation (60%)</button>
          <button className="btn-secondary" style={{ width: '100%', fontSize: '12px', marginBottom: '8px' }} onClick={() => updateThreshold(80)}>Balanced (80%)</button>
          <button className="btn-primary" style={{ width: '100%', fontSize: '12px' }} onClick={() => updateThreshold(100)}>Full Power (100%)</button>
        </div>
      </div>
    </div>
  );
};
