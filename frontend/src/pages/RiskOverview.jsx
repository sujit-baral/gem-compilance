import { useState, useEffect } from "react";
import { listApplications } from "../api/client";

export default function RiskOverview({ onSelectApplication, goToDashboard }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listApplications().then((data) => {
      setApplications(data);
      setLoading(false);
    });
  }, []);

  const counts = { Low: 0, Medium: 0, High: 0, Pending: 0 };
  applications.forEach((a) => {
    const risk = a.risk_level || "Pending";
    counts[risk] = (counts[risk] || 0) + 1;
  });

  function handleView(applicationId) {
    onSelectApplication(applicationId);
    goToDashboard();
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Bidder Risk Overview</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
            <SummaryCard label="Low Risk" count={counts.Low} color="#2e7d32" />
            <SummaryCard label="Medium Risk" count={counts.Medium} color="#f9a825" />
            <SummaryCard label="High Risk" count={counts.High} color="#c62828" />
            <SummaryCard label="Not Yet Scored" count={counts.Pending} color="#888" />
          </div>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
                <th style={{ padding: 8 }}>Tender ID</th>
                <th style={{ padding: 8 }}>Bidder</th>
                <th style={{ padding: 8, textAlign: "center" }}>Score</th>
                <th style={{ padding: 8, textAlign: "center" }}>Risk</th>
                <th style={{ padding: 8 }}>Decision</th>
                <th style={{ padding: 8 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.application_id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 8, fontWeight: "bold" }}>{a.tender_id}</td>
                  <td style={{ padding: 8 }}>
                    <div style={{ fontWeight: "bold" }}>{a.bidder_name}</div>
                    <div style={{ fontSize: 12, color: "#888", fontFamily: "monospace" }}>{a.application_id}</div>
                  </td>
                  <td style={{ padding: 8, textAlign: "center", fontWeight: "bold", fontSize: 16 }}>
                    {a.compliance_score != null ? `${a.compliance_score}%` : "-"}
                  </td>
                  <td style={{ padding: 8, textAlign: "center" }}>
                    <span
                       style={{
                         color: riskColor(a.risk_level),
                         fontWeight: "bold",
                       }}
                    >
                      {a.risk_level || "Pending"}
                    </span>
                  </td>
                  <td style={{ padding: 8, fontWeight: "bold" }}>{a.decision || "Pending"}</td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => handleView(a.application_id)} style={{ padding: "4px 10px", fontSize: 12 }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, count, color }) {
  return (
    <div style={{ flex: 1, background: "#f5f5f5", padding: 16, borderRadius: 8, textAlign: "center" }}>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: "bold", color }}>{count}</div>
    </div>
  );
}

function riskColor(risk) {
  if (risk === "Low") return "#2e7d32";
  if (risk === "Medium") return "#f9a825";
  if (risk === "High") return "#c62828";
  return "#888";
}