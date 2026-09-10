import { useState } from "react";
import { ToastProvider } from "./context/ToastContext";
import Logo from "./components/Logo";
import BackendHealthIndicator from "./components/BackendHealthIndicator";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import TenderWorkspace from "./pages/TenderWorkspace";
import CreateTender from "./pages/CreateTender";
import StartApplication from "./pages/StartApplication";
import UploadDocuments from "./pages/UploadDocuments";
import Dashboard from "./pages/Dashboard";
import RiskOverview from "./pages/RiskOverview";
import BidderTracker from "./pages/BidderTracker";

function MainApp() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("gem_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [view, setView] = useState(() => {
    try {
      const savedView = localStorage.getItem("gem_view");
      if (savedView) return savedView;
      const savedUser = localStorage.getItem("gem_user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        return u.role === "officer" ? "overview" : "workspace";
      }
      return null;
    } catch {
      return null;
    }
  });

  const [tenderId, setTenderId] = useState(() => {
    try { return localStorage.getItem("gem_tenderId") || ""; } catch { return ""; }
  });
  const [applicationId, setApplicationId] = useState(() => {
    try { return localStorage.getItem("gem_applicationId") || ""; } catch { return ""; }
  });
  const [checklist, setChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem("gem_checklist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    const initialView = loggedInUser.role === "officer" ? "overview" : "tracker";
    setView(initialView);
    try {
      localStorage.setItem("gem_user", JSON.stringify(loggedInUser));
      localStorage.setItem("gem_view", initialView);
    } catch (e) {
      console.error(e);
    }
  }

  function handleLogout() {
    setUser(null);
    setView(null);
    setTenderId("");
    setApplicationId("");
    setChecklist([]);
    try {
      localStorage.removeItem("gem_user");
      localStorage.removeItem("gem_view");
      localStorage.removeItem("gem_tenderId");
      localStorage.removeItem("gem_applicationId");
      localStorage.removeItem("gem_checklist");
    } catch (e) {
      console.error(e);
    }
  }

  function handleViewChange(newView) {
    setView(newView);
    try {
      localStorage.setItem("gem_view", newView);
    } catch (e) {
      console.error(e);
    }
  }

  function handleApplyToTender(id) {
    setTenderId(id);
    handleViewChange("apply");
    try {
      localStorage.setItem("gem_tenderId", id);
    } catch (e) {
      console.error(e);
    }
  }

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  const officerTabs = [
    { key: "overview", label: "Risk Overview", icon: "📊" },
    { key: "dashboard", label: "Dashboard", icon: "🛡️" },
    { key: "tender", label: "Create Tender", icon: "➕" },
    { key: "alltenders", label: "All Tenders", icon: "📁" },
  ];

  const bidderTabs = [
    { key: "tracker", label: "My Applications & Status", icon: "📊" },
    { key: "workspace", label: "Tenders", icon: "📋" },
    { key: "apply", label: "Apply for Bid", icon: "📝" },
    { key: "upload", label: "Upload & Verify", icon: "📤" },
  ];

  const tabs = user.role === "officer" ? officerTabs : bidderTabs;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-app)" }}>
      {/* Mobile-Friendly Sticky Navigation Header */}
      <header
        className="app-header-container"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            maxWidth: "var(--max-w-content)",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Top Row: Brand, Role Badge & User Account */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              minWidth: 0,
              width: "100%",
            }}
          >
            {/* Brand Logo & Name */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, minWidth: 0 }}>
              <Logo size="sm" subtitle="Compliance" showSubtitle={false} />
              <span
                className={user.role === "officer" ? "badge badge-info" : "badge badge-purple"}
                style={{ textTransform: "capitalize", fontSize: 9.5, padding: "2px 6px", flexShrink: 0 }}
              >
                {user.role === "officer" ? "Officer" : "Bidder"}
              </span>
            </div>

            {/* User Identity & Logout */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 1, minWidth: 0, justifyContent: "flex-end" }}>
              <div className="header-user-info">
                <div className="header-user-name" title={user.name}>
                  {user.name}
                </div>
                {user.bidderId && (
                  <div className="header-bidder-id" title={user.bidderId}>
                    {user.bidderId}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                style={{
                  padding: "4px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                  background: "transparent",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
                title="Sign out"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="sign-out-text">Logout</span>
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
                  onClick={() => handleViewChange(tab.key)}
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
          {view === "tracker" && (
            <BidderTracker
              bidderId={user.bidderId}
              bidderName={user.name}
              onSelectApplication={(id) => {
                setApplicationId(id);
                try { localStorage.setItem("gem_applicationId", id); } catch {}
              }}
              goToUpload={() => handleViewChange("upload")}
              goToApply={() => handleViewChange("workspace")}
            />
          )}
          {view === "workspace" && <TenderWorkspace onApply={handleApplyToTender} role="bidder" />}
          {view === "alltenders" && <TenderWorkspace role="officer" />}
          {view === "tender" && <CreateTender onTenderCreated={setTenderId} />}
          {view === "apply" && (
            <StartApplication
              onApplicationCreated={(id) => {
                setApplicationId(id);
                try { localStorage.setItem("gem_applicationId", id); } catch {}
              }}
              onChecklistReady={(list) => {
                setChecklist(list);
                try { localStorage.setItem("gem_checklist", JSON.stringify(list)); } catch {}
              }}
              tenderId={tenderId}
              setTenderId={(id) => {
                setTenderId(id);
                try { localStorage.setItem("gem_tenderId", id); } catch {}
              }}
              bidderId={user.bidderId}
              bidderName={user.name}
              goToUpload={() => handleViewChange("upload")}
            />
          )}
          {view === "upload" && (
            <UploadDocuments
              applicationId={applicationId}
              setApplicationId={(id) => {
                setApplicationId(id);
                try { localStorage.setItem("gem_applicationId", id); } catch {}
              }}
              checklist={checklist}
            />
          )}
          {view === "overview" && (
            <RiskOverview
              onSelectApplication={(id) => {
                setApplicationId(id);
                try { localStorage.setItem("gem_applicationId", id); } catch {}
              }}
              goToDashboard={() => handleViewChange("dashboard")}
            />
          )}
          {view === "dashboard" && (
            <Dashboard
              applicationId={applicationId}
              setApplicationId={(id) => {
                setApplicationId(id);
                try { localStorage.setItem("gem_applicationId", id); } catch {}
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
      <BackendHealthIndicator />
    </ToastProvider>
  );
}

