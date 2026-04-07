import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

// View Imports
import { Dashboard } from "./views/Dashboard";
import { Logs } from "./views/Logs";
import { Core } from "./views/Core";

// Component Imports
import { Sidebar } from "./components/layout/Sidebar";

function App() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notification, setNotification] = useState(null);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
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
            temperature: res.cpu_temperature || 0
          }]);
          setError(null);
        })
        .catch((err) => setError(err));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab]);


  if (!metrics) return <div className="app-container" style={{background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading WattWise Suite...</div>;

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="content-container">
        <header>
          <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div>
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em', opacity: 0.7 }}>
                STATUS: NOMINAL
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
          {activeTab === "logs" && <Logs metrics={metrics} />}
          {activeTab === "settings" && <Core metrics={metrics} notify={notify} />}
        </main>
      </div>
    </div>
  );
}

export default App;
