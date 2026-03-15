export const Dashboard = ({ metrics }) => (
  <div className="page-layout">
    <div className="main-pane">
      <div className="metrics-grid">
        <div className="stat-card">
          <div className="label">Live CPU Load</div>
          <div className="value">{metrics.total_cpu_usage.toFixed(1)}%</div>
        </div>
        <div className="stat-card">
          <div className="label">Thermal Status</div>
          <div className="value">{metrics.load_avg[0].toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Power Source</div>
          <div className="value" style={{ fontSize: '18px', color: 'var(--brand-accent)' }}>
            {metrics.is_charging ? "External AC" : "Internal Battery"}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Memory Engine</div>
          <div className="value">{(metrics.memory_used / 1024 / 1024 / 1024).toFixed(1)} GB</div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>of {(metrics.memory_total / 1024 / 1024 / 1024).toFixed(1)} GB Total</div>
        </div>
        <div className="stat-card">
          <div className="label">Storage Logic</div>
          <div className="value">{metrics.disk_usage.toFixed(0)}%</div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Primary Filesystem</div>
        </div>
      </div>
      
      <div className="glass-card">
        <div className="label">Frequency Distribution ({metrics.cores.length} Cores)</div>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          {metrics.cores.map((core) => (
            <div key={core.id} className="mini-stat">
              <span className="label">Core {core.id}</span>
              <span className="val">{core.frequency} MHz</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
