import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import TenderWorkspace from "./pages/TenderWorkspace";
import CreateTender from "./pages/CreateTender";
import StartApplication from "./pages/StartApplication";
import UploadDocuments from "./pages/UploadDocuments";
import Dashboard from "./pages/Dashboard";
import RiskOverview from "./pages/RiskOverview";

function App() {
  const [user, setUser] = useState(null); // { role: "officer"|"bidder", name, bidderId? }
  const [view, setView] = useState(null);

  const [tenderId, setTenderId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [checklist, setChecklist] = useState([]);

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setView(loggedInUser.role === "officer" ? "overview" : "workspace");
  }

  function handleLogout() {
    setUser(null);
    setView(null);
    setTenderId("");
    setApplicationId("");
    setChecklist([]);
  }

  function handleApplyToTender(id) {
    setTenderId(id);
    setView("apply");
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const officerTabs = [
    { key: "overview", label: "Risk Overview", icon: "📊" },
    { key: "dashboard", label: "Compliance Dashboard", icon: "🛡️" },
    { key: "tender", label: "Create Tender", icon: "➕" },
    { key: "alltenders", label: "All Tenders", icon: "📁" },
  ];

  const bidderTabs = [
    { key: "workspace", label: "Tenders", icon: "📋" },
    { key: "apply", label: "Apply for Bid", icon: "📝" },
    { key: "upload", label: "Upload & Verify", icon: "📤" },
  ];

  const tabs = user.role === "officer" ? officerTabs : bidderTabs;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-app)" }}>
      {/* Sleek Minimalist Navbar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 24px",
          height: 62,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand & Role Tag */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-md)",
              background: "var(--brand-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: "-0.04em",
            }}
          >
            GeM
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              Compliance Portal
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: -2 }}>
              Government e-Marketplace
            </span>
          </div>

          <span
            className={user.role === "officer" ? "badge badge-info" : "badge badge-purple"}
            style={{ marginLeft: 6, textTransform: "capitalize" }}
          >
            {user.role === "officer" ? "Officer Portal" : "Bidder Portal"}
          </span>
        </div>

        {/* Segmented Tab Navigation */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--bg-subtle)",
            padding: 3,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            gap: 2,
          }}
        >
          {tabs.map((tab) => {
            const isActive = view === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                style={{
                  background: isActive ? "#FFFFFF" : "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  padding: "6px 13px",
                  fontSize: 12.5,
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 13 }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* User Identity & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</div>
            {user.bidderId && (
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                {user.bidderId}
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 500,
              background: "transparent",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-secondary)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-subtle)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "28px 24px 64px", maxWidth: "var(--max-w-content)", width: "100%", margin: "0 auto" }}>
        <div className="animate-fade-in" key={view}>
          {view === "workspace" && <TenderWorkspace onApply={handleApplyToTender} role="bidder" />}
          {view === "alltenders" && <TenderWorkspace role="officer" />}
          {view === "tender" && <CreateTender onTenderCreated={setTenderId} />}
          {view === "apply" && (
            <StartApplication
              onApplicationCreated={setApplicationId}
              onChecklistReady={setChecklist}
              tenderId={tenderId}
              setTenderId={setTenderId}
              bidderId={user.bidderId}
              bidderName={user.name}
              goToUpload={() => setView("upload")}
            />
          )}
          {view === "upload" && (
            <UploadDocuments
              applicationId={applicationId}
              setApplicationId={setApplicationId}
              checklist={checklist}
            />
          )}
          {view === "overview" && (
            <RiskOverview
              onSelectApplication={setApplicationId}
              goToDashboard={() => setView("dashboard")}
            />
          )}
          {view === "dashboard" && (
            <Dashboard applicationId={applicationId} setApplicationId={setApplicationId} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
