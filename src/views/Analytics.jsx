export const Analytics = ({ history }) => (
  <div className="page-layout">
    <div className="main-pane">
      <div className="glass-card">
        <div className="label">Dynamic Usage Heuristics</div>
        <div className="chart-area" style={{ height: '240px' }}>
          {history.map((h, i) => (
            <div key={i} className="bar" style={{ height: `${h.usage}%` }}></div>
          ))}
        </div>
      </div>
    </div>

    <div className="side-pane glass-card">
      <div className="label">Analytics Filter</div>
      <select className="btn-secondary" style={{ width: '100%', marginTop: '12px' }}>
        <option>CPU Usage</option>
        <option>Frequency</option>
        <option>Temperature</option>
      </select>
    </div>
  </div>
);
