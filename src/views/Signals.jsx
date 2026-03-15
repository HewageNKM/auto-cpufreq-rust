export const Signals = ({ logs, logRef }) => (
  <div className="view-fade-in">
    <div className="glass-card">
      <div className="label">System Service Logs (zenith-energy.service)</div>
      <div className="log-stream" ref={logRef}>
        {logs || "Retrieving kernel hooks and engine signals..."}
      </div>
    </div>
  </div>
);
