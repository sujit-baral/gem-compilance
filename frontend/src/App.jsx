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
    { key: "dashboard", label: "Dashboard", icon: "🛡️" },
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
      {/* Mobile-Friendly Sticky Navigation Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "10px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "var(--max-w-content)",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* Top Row: Brand, Role Badge & User Account */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            {/* Brand Logo & Name */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--brand-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                GeM
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>
                  Compliance Portal
                </span>
                <span
                  className={user.role === "officer" ? "badge badge-info" : "badge badge-purple"}
                  style={{ textTransform: "capitalize", fontSize: 10 }}
                >
                  {user.role === "officer" ? "Officer" : "Bidder"}
                </span>
              </div>
            </div>

            {/* User Identity & Logout */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name}
                </div>
                {user.bidderId && (
                  <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    {user.bidderId}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                style={{
                  padding: "4px 8px",
                  fontSize: 11.5,
                  fontWeight: 500,
                  background: "transparent",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Bottom Row: Horizontally Scrollable Tabs (Ensures 100% Mobile Friendliness) */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--bg-subtle)",
              padding: 3,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              gap: 4,
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
            }}
          >
            {tabs.map((tab) => {
              const isActive = view === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setView(tab.key)}
                  style={{
                    flex: "1 0 auto",
                    background: isActive ? "#FFFFFF" : "transparent",
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Responsive Wrapper */}
      <main
        style={{
          flex: 1,
          padding: "20px 14px 56px",
          maxWidth: "var(--max-w-content)",
          width: "100%",
          margin: "0 auto",
        }}
      >
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
