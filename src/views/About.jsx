export const About = () => (
  <div className="view-fade-in glass-card" style={{ textAlign: 'center', padding: '64px' }}>
    <div className="logo-container" style={{ marginBottom: '24px' }}>
      <img src="/logo.png" style={{ width: '80px', height: '80px' }} alt="Zenith Logo" />
    </div>
    <h2 style={{ fontSize: '32px', margin: '0 0 16px 0', color: 'var(--brand-accent)' }}>WattWise</h2>
    <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
      An open-source system optimization suite for Linux. 
      Engineered for peak performance and silent efficiency.
    </p>

    <div className="glass-card" style={{ marginTop: '48px', padding: '24px', background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
      <div className="label" style={{ marginBottom: '16px' }}>Technical specifications</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Engine Runtime</td>
            <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>Rust 1.75.0 (Optimized)</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Frontend Layer</td>
            <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>Tauri + Vite + React</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Daemon Interface</td>
            <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>SysV/systemd Integrated</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Binary Path</td>
            <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '400', fontFamily: 'monospace' }}>/usr/bin/wattwise</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div className="credit-badge" style={{ marginTop: '32px' }}>Legacy Code provided by auto-cpufreq</div>
    
    <p style={{ fontSize: '11px', marginTop: '48px', color: 'var(--text-secondary)', opacity: 0.6 }}>
      Version 3.0.0 (Open-Source Edition)<br/>
      &copy; 2026 WattWise Project Contributors
    </p>
  </div>
);
