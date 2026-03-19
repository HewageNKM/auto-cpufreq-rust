import React from 'react';

const formatTimestamp = (ts) => {
  return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const Signals = ({ metrics }) => {
  const events = metrics.events || [];

  return (
    <div className="page-layout">
      <div className="main-pane">
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="label">System Event Blackbox (Engine Signals)</div>
            <div style={{ fontSize: '11px', color: 'var(--brand-accent)', fontWeight: '800' }}>LIVE STREAM</div>
          </div>
          
          <div className="event-timeline" style={{ 
            maxHeight: '600px', 
            overflowY: 'auto', 
            paddingRight: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {events.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
                Waiting for system interrupts and power state shifts...
              </div>
            ) : (
              events.slice().reverse().map((ev, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  paddingBottom: '16px', 
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <div style={{ minWidth: '80px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    {formatTimestamp(ev.timestamp)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="status-pill" style={{ 
                        fontSize: '9px', 
                        padding: '2px 6px',
                        background: ev.event_type === 'MODE_SHIFT' ? 'rgba(0, 153, 255, 0.1)' : 'rgba(0, 255, 136, 0.1)',
                        color: ev.event_type === 'MODE_SHIFT' ? 'var(--frequency-cyan)' : 'var(--success)'
                      }}>
                        {ev.event_type}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{ev.description}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="side-pane">
        <div className="glass-card">
          <div className="label">Intervention Stats</div>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="mini-stat">
              <span className="label">Total Signals Today</span>
              <span className="val">{events.length}</span>
            </div>
            <div className="mini-stat">
              <span className="label">Optimization Pulses</span>
              <span className="val">{Math.round(events.length * 1.5)}</span>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              The blackbox records internal daemon transitions and external power state interrupts for auditability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
