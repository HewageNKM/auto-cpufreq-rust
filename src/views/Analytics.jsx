import { useState } from "react";

const getSlope = (data) => {
  if (data.length < 3) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  const n = data.length;
  data.forEach((d, i) => {
    sumX += i;
    sumY += (d.battery || 0);
    sumXY += i * (d.battery || 0);
    sumXX += i * i;
  });
  const denom = (n * sumXX - sumX * sumX);
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
};

export const Analytics = ({ history, metrics }) => {
  const [activeFilter, setActiveFilter] = useState("usage");

  const getPercentage = (h) => {
    switch (activeFilter) {
      case "frequency": return (h.frequency / 5000) * 100; 
      case "temperature": return h.temperature; 
      case "battery": return h.battery; 
      default: return h.usage;
    }
  };

  const getDisplayValue = (h) => {
    switch (activeFilter) {
      case "frequency": return `${Math.round(h.frequency)} MHz`;
      case "temperature": return `${h.temperature.toFixed(1)}°C`;
      case "battery": return `${Math.round(h.battery)}%`;
      default: return `${h.usage.toFixed(1)}%`;
    }
  };

  const avgUsage = history.length > 0 
    ? history.reduce((acc, h) => acc + (activeFilter === "usage" ? h.usage : getPercentage(h)), 0) / history.length 
    : 0;
  
  const peakUsage = history.length > 0 
    ? Math.max(...history.map(h => activeFilter === "usage" ? h.usage : getPercentage(h))) 
    : 0;

  const health = metrics.battery_health || 100;
  const isCharging = metrics.is_charging;

  const slope = getSlope(history);
  const advices = [];

  if (slope < 0 && metrics.battery_level) {
    const mins = (metrics.battery_level / (Math.abs(slope) * 60)).toFixed(0);
    if (mins > 0 && mins < 600) {
      advices.push(`AI Projection: Workload trend discharges battery fully in approx ${mins} mins.`);
    }
  }

  if (health < 80 && !isCharging) {
    advices.push("Your battery health is below 80%. We recommend enforcing 'Efficiency' mode to maximize endurance.");
  }
  if (!isCharging && avgUsage > 40) {
    advices.push("Aggressive CPU demand on battery detected. Consider disabling 'Turbo Boost' to guard thermals.");
  }
  if (isCharging) {
    advices.push("Connected to AC. Heuristics are unlocked for maximum scaling thresholds.");
  } else if (avgUsage <= 15) {
    advices.push("System idle on battery. Zenith Engine running at peak continuous efficiency.");
  }
  if (metrics.config.battery_threshold > 80 && health < 90) {
    advices.push("Consider locking charge threshold to 80% with sidebar config to slow cell degradation.");
  }

  return (
    <div className="page-layout">
      <div className="main-pane">
        <div className="glass-card">
          <div className="label" style={{ textTransform: 'uppercase' }}>
            Dynamic {activeFilter} Heuristics (Last 30s)
          </div>
          <div className="chart-area" style={{ 
            height: '240px', 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '6px',
            padding: '24px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '16px',
            marginTop: '16px',
            border: '1px solid var(--border)'
          }}>
            {history.map((h, i) => (
              <div 
                key={i} 
                className="chart-bar" 
                style={{ 
                  height: `${Math.max(4, getPercentage(h))}%`, 
                  flex: 1,
                  background: activeFilter === "battery" ? 'linear-gradient(to top, #00ff88, #00ffaa)' : 'linear-gradient(to top, var(--brand-accent), var(--success))',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.3s ease',
                  position: 'relative'
                }}
                title={`${h.time}: ${getDisplayValue(h)}`}
              ></div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div><strong>Rolling Average:</strong> {activeFilter === "usage" ? `${avgUsage.toFixed(1)}%` : activeFilter === "frequency" ? `${Math.round(history.reduce((a,h)=>a+h.frequency,0)/history.length)} MHz` : `${avgUsage.toFixed(1)}`}</div>
            <div><strong>Peak Load:</strong> {activeFilter === "usage" ? `${peakUsage.toFixed(1)}%` : activeFilter === "frequency" ? `${Math.round(Math.max(...history.map(h=>h.frequency)))} MHz` : `${peakUsage.toFixed(1)}`}</div>
          </div>
        </div>

        <div className="glass-card" style={{ marginTop: '24px' }}>
          <div className="label">Proactive AI Advisor</div>
          <div style={{ marginTop: '12px', padding: '16px', background: 'rgba(0, 112, 243, 0.05)', borderRadius: '12px', border: '1px solid var(--brand-accent)' }}>
            <div style={{ fontWeight: '700', color: 'var(--brand-accent)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>💡</span> System Optimization Advice
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)' }}>
              {advices.map((advice, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>{advice}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="glass-card" style={{ marginTop: '24px' }}>
          <div className="label">Multi-Core Frequency Stratification</div>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'space-between', 
            marginTop: '12px',
            padding: '16px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px'
          }}>
            {metrics.cores.map((core) => (
              <div key={core.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                <div style={{ 
                  height: '80px', 
                  width: '100%', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '6px', 
                  position: 'relative', 
                  overflow: 'hidden',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    width: '100%', 
                    height: `${Math.min(100, (core.frequency / 5000) * 100)}%`, 
                    background: 'linear-gradient(to top, var(--brand-accent), var(--success))', 
                    transition: 'height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
                  }}></div>
                </div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-main)' }}>{core.frequency}</div>
                <div style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-secondary)' }}>C{core.id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="side-pane">
        <div className="glass-card">
          <div className="label">Analytics Filter</div>
          <select 
            className="btn-secondary" 
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            style={{ 
              width: '100%', 
              marginTop: '12px',
              background: 'var(--panel-bg)',
              color: 'var(--text-main)',
              borderColor: 'var(--border)',
              cursor: 'pointer',
              padding: '12px',
              appearance: 'none',
              WebkitAppearance: 'none',
              borderRadius: '12px'
            }}
          >
            <option value="usage" style={{ background: 'var(--panel-bg)', color: 'var(--text-main)' }}>CPU Usage</option>
            <option value="frequency" style={{ background: 'var(--panel-bg)', color: 'var(--text-main)' }}>Frequency</option>
            <option value="temperature" style={{ background: 'var(--panel-bg)', color: 'var(--text-main)' }}>Temperature</option>
            <option value="battery" style={{ background: 'var(--panel-bg)', color: 'var(--text-main)' }}>Battery Level</option>
          </select>
        </div>

        <div className="glass-card" style={{ marginTop: '24px' }}>
          <div className="label">Resource Utilization (Top CPU Consumers)</div>
          <table style={{ width: '100%', marginTop: '12px', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '8px 4px', fontWeight: '400' }}>Process Name</th>
                <th style={{ padding: '8px 4px', fontWeight: '400', textAlign: 'right' }}>CPU Load</th>
              </tr>
            </thead>
            <tbody>
              {metrics.top_processes?.map((proc, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ 
                    padding: '10px 4px', 
                    color: 'var(--text-main)', 
                    fontWeight: '800', 
                    maxWidth: '140px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {proc.name}
                  </td>
                  <td style={{ 
                    padding: '10px 4px', 
                    textAlign: 'right', 
                    fontWeight: '800', 
                    color: 'var(--brand-accent)' 
                  }}>
                    {proc.cpu_usage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
