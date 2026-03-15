import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

// View Imports
import { Dashboard } from "./views/Dashboard";
import { Battery } from "./views/Battery";
import { Analytics } from "./views/Analytics";
import { Signals } from "./views/Signals";
import { Core } from "./views/Core";
import { About } from "./views/About";

// Component Imports
import { Sidebar } from "./components/layout/Sidebar";

function App() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState("");
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notification, setNotification] = useState(null);
  const logRef = useRef(null);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const formatTime = (hours) => {
    if (!hours) return "Calculating...";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      invoke("get_metrics")
        .then((res) => {
          setMetrics(res);
          const avgFreq = res.cores.length > 0 
            ? res.cores.reduce((sum, c) => sum + c.frequency, 0) / res.cores.length 
            : 0;

          setHistory(prev => [...prev.slice(-29), {
            time: new Date().toLocaleTimeString(),
            usage: res.total_cpu_usage,
            frequency: avgFreq,
            temperature: res.cpu_temperature || 0,
            battery: res.battery_level || 0
          }]);
          setError(null);
        })
        .catch((err) => setError(err));
      
      if (activeTab === "logs" || activeTab === "signals") {
        invoke("get_logs")
          .then(setLogs)
          .catch(console.error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  if (!metrics) return <div className="app-container" style={{background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading Zenith Energy Suite...</div>;

  return (
    <div className={`app-container ${metrics.battery_level <= 15.0 && !metrics.is_charging ? 'power-saver-theme' : ''}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="content-container">
        <header>
          <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div>
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em', opacity: 0.7 }}>
                {metrics.is_charging ? "AC POWER" : "BATTERY"}
            </span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: '600', opacity: 0.5 }}>
            {new Date().toLocaleTimeString()}
          </div>
        </header>

        <main className="main-content">
          {notification && (
            <div className="toast-notification">
              <span className="toast-icon">✅</span>
              {notification}
            </div>
          )}
          {error && <div className="glass-card" style={{ color: "#ef4444", borderColor: '#ef4444', marginBottom: '24px' }}>{error}</div>}
          
          {activeTab === "dashboard" && <Dashboard metrics={metrics} />}
          {activeTab === "battery" && <Battery metrics={metrics} formatTime={formatTime} notify={notify} />}
          {activeTab === "analytics" && <Analytics history={history} metrics={metrics} />}
          {activeTab === "logs" && <Signals logs={logs} logRef={logRef} />}
          {activeTab === "settings" && <Core metrics={metrics} notify={notify} />}
          {activeTab === "about" && <About />}
        </main>
      </div>
    </div>
  );
}

export default App;
