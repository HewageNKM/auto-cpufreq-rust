import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export const Battery = ({ metrics, formatTime, notify }) => {
  const [threshold, setThreshold] = useState(metrics.config.battery_threshold || 80);

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

        <div className="glass-card" style={{ marginTop: '24px' }}>
          <div className="label" style={{ marginBottom: '16px' }}>Technical Vitals (Advanced Telemetry)</div>
          <table className="vitals-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '8px 0', fontWeight: '400' }}>Metric</th>
                <th style={{ padding: '8px 0', fontWeight: '400' }}>Standard Value</th>
                <th style={{ padding: '8px 0', fontWeight: '400' }}>Context</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 0', color: 'var(--text-secondary)' }}>Potential</td>
                <td style={{ padding: '12px 0', fontWeight: '800', color: 'var(--brand-accent)' }}>{metrics.battery_voltage?.toFixed(2) || "N.A"} V</td>
                <td style={{ padding: '12px 0', fontSize: '10px', color: 'var(--text-secondary)' }}>Current line voltage</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 0', color: 'var(--text-secondary)' }}>Flow Rate</td>
                <td style={{ padding: '12px 0', fontWeight: '800', color: '#fb1' }}>{metrics.battery_current?.toFixed(3) || "N.A"} A</td>
                <td style={{ padding: '12px 0', fontSize: '10px', color: 'var(--text-secondary)' }}>Amperage draw/charge</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 0', color: 'var(--text-secondary)' }}>Design Capacity</td>
                <td style={{ padding: '12px 0', fontWeight: '600' }}>{(metrics.battery_capacity_design || 0).toFixed(2)} Wh/Ah</td>
                <td style={{ padding: '12px 0', fontSize: '10px', color: 'var(--text-secondary)' }}>Factory spec max</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 0', color: 'var(--text-secondary)' }}>Cycle Integrity</td>
                <td style={{ padding: '12px 0', fontWeight: '600' }}>{(metrics.battery_capacity_full || 0).toFixed(2)} Wh/Ah</td>
                <td style={{ padding: '12px 0', fontSize: '10px', color: 'var(--text-secondary)' }}>Current usable max</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 0', color: 'var(--text-secondary)' }}>Hardware</td>
                <td style={{ padding: '12px 0', fontWeight: '600' }}>{metrics.manufacturer || "Generic"}</td>
                <td style={{ padding: '12px 0', fontSize: '10px', color: 'var(--text-secondary)' }}>System vendor identity</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 0', color: 'var(--text-secondary)' }}>Serialization</td>
                <td style={{ padding: '12px 0', fontWeight: '400', fontFamily: 'monospace' }}>{metrics.serial_number || "N.A"}</td>
                <td style={{ padding: '12px 0', fontSize: '10px', color: 'var(--text-secondary)' }}>Unique component ID</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: '16px', fontSize: '10px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Internal calculation: ({((metrics.battery_capacity_full / metrics.battery_capacity_design) * 100).toFixed(1)}%) based on design vs current maximum.
          </div>
        </div>
      </div>

      <div className="side-pane glass-card">
        <div className="label">Battery Optimization</div>
        <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <p>Restricting the maximum charge level significantly extends the chemical lifespan of your lithium-ion cells.</p>
          <p style={{ marginTop: '12px' }}>This setting is persisted to <code>/etc/zenith-energy/config.json</code> and applied automatically on boot.</p>
        </div>
      </div>
    </div>
  );
};
