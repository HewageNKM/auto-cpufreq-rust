export const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "battery", label: "Battery", icon: "🔋" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "logs", label: "Signals", icon: "📡" },
    { id: "settings", label: "Core", icon: "⚙️" },
    { id: "about", label: "About", icon: "ℹ️" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-container">
          <img src="/logo.png" alt="Z" />
        </div>
        <span>Zenith Energy</span>
      </div>
      <nav className="nav-links">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
