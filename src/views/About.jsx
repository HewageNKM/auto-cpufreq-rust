export const About = () => (
  <div className="view-fade-in glass-card" style={{ textAlign: 'center', padding: '64px' }}>
    <div className="logo-container" style={{ marginBottom: '24px' }}>
      <img src="/logo.png" style={{ width: '80px', height: '80px' }} alt="Zenith Logo" />
    </div>
    <h2 style={{ fontSize: '32px', margin: '0 0 16px 0', color: 'var(--brand-accent)' }}>Zenith Energy</h2>
    <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
      A professional-grade system optimization suite for Linux distributions. 
      Engineered for peak performance and silent efficiency.
    </p>
    
    <div className="credit-badge">Legacy Code provided by auto-cpufreq</div>
    
    <p style={{ fontSize: '11px', marginTop: '48px', color: 'var(--text-secondary)', opacity: 0.6 }}>
      Version 3.0.0 (Professional)<br/>
      &copy; 2026 Zenith Technologies
    </p>
  </div>
);
