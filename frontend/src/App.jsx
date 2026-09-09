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
    { key: "tender", label: "Create Tender" },
    { key: "alltenders", label: "All Tenders" },
    { key: "overview", label: "Risk Overview" },
    { key: "dashboard", label: "Dashboard" },
  ];

  const bidderTabs = [
    { key: "workspace", label: "Tender Workspace" },
    { key: "apply", label: "Apply to Tender" },
    { key: "upload", label: "Upload Documents" },
  ];

  const tabs = user.role === "officer" ? officerTabs : bidderTabs;

  return (
    <div style={{ minHeight: "100vh" }}>
      <div
        style={{
          background: "#101828",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ color: "white", fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, fontWeight: 600 }}>
          GeM Compliance Verification
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              style={{
                background: view === tab.key ? "#B7791F" : "rgba(255,255,255,0.08)",
                color: "white",
                border: "none",
                borderRadius: 20,
                padding: "8px 16px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)", margin: "0 4px" }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12.5 }}>
            {user.role === "officer" ? user.name : `${user.name} (${user.bidderId})`}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "white",
              border: "none",
              borderRadius: 20,
              padding: "8px 16px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </div>

      <div style={{ padding: "20px 16px 60px" }}>
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
    </div>
  );
}

export default App;
