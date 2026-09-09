import { useState, useEffect } from "react";
import { listApplications } from "../api/client";

export default function RiskOverview({ onSelectApplication, goToDashboard }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    listApplications().then((data) => {
      setApplications(Array.isArray(data) ? data : []);
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

  const filteredApps = applications.filter((a) => {
    const matchesRisk = filterRisk === "all" || (a.risk_level || "Pending") === filterRisk;
    const matchesSearch =
      (a.tender_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.bidder_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.application_id || "").toLowerCase().includes(search.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2>Bidder Risk &amp; Compliance Overview</h2>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 2 }}>
          Real-time risk scoring and compliance tracking across all tender bid submissions.
        </p>
      </div>

      {/* KPI Statistic Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <SummaryCard
          label="Low Risk"
          count={counts.Low}
          variant="success"
          active={filterRisk === "Low"}
          onClick={() => setFilterRisk(filterRisk === "Low" ? "all" : "Low")}
        />
        <SummaryCard
          label="Medium Risk"
          count={counts.Medium}
          variant="warning"
          active={filterRisk === "Medium"}
          onClick={() => setFilterRisk(filterRisk === "Medium" ? "all" : "Medium")}
        />
        <SummaryCard
          label="High Risk"
          count={counts.High}
          variant="danger"
          active={filterRisk === "High"}
          onClick={() => setFilterRisk(filterRisk === "High" ? "all" : "High")}
        />
        <SummaryCard
          label="Pending Scored"
          count={counts.Pending}
          variant="neutral"
          active={filterRisk === "Pending"}
          onClick={() => setFilterRisk(filterRisk === "Pending" ? "all" : "Pending")}
        />
      </div>

      {/* Search & Action Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Filter by tender ID, bidder name, application ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360, fontSize: 13, padding: "8px 12px" }}
        />

        <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
          Showing <strong>{filteredApps.length}</strong> of <strong>{applications.length}</strong> applications
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading risk overview...
        </div>
      ) : filteredApps.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "48px 20px",
            color: "var(--text-muted)",
            borderStyle: "dashed",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
          <h4 style={{ color: "var(--text-primary)" }}>No applications found</h4>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            {applications.length === 0
              ? "No bidders have applied to tenders yet."
              : "No applications match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tender Reference</th>
                <th>Bidder Entity</th>
                <th style={{ textAlign: "center" }}>Compliance Score</th>
                <th style={{ textAlign: "center" }}>Assessed Risk</th>
                <th>Officer Decision</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((a) => (
                <tr key={a.application_id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{a.tender_title || a.tender_id}</div>
                    <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      {a.tender_id}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.bidder_name}</div>
                    <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      {a.application_id}
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {a.compliance_score != null ? (
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{a.compliance_score}%</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      className={
                        a.risk_level === "Low"
                          ? "badge badge-success"
                          : a.risk_level === "Medium"
                          ? "badge badge-warning"
                          : a.risk_level === "High"
                          ? "badge badge-danger"
                          : "badge badge-neutral"
                      }
                    >
                      {a.risk_level || "Pending"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        a.decision === "Qualified"
                          ? "badge badge-success"
                          : a.decision === "Disqualified"
                          ? "badge badge-danger"
                          : a.decision === "Clarification Requested"
                          ? "badge badge-warning"
                          : "badge badge-neutral"
                      }
                    >
                      {a.decision || "Pending Decision"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="primary"
                      onClick={() => handleView(a.application_id)}
                      style={{ padding: "5px 12px", fontSize: 12 }}
                    >
                      Evaluate &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, count, variant, active, onClick }) {
  const badgeMap = {
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
    neutral: "var(--text-secondary)",
  };

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: "16px 20px",
        borderColor: active ? "var(--brand-primary)" : "var(--border-subtle)",
        boxShadow: active ? "var(--shadow-md)" : "var(--shadow-xs)",
        transition: "all 0.15s ease",
      }}
    >
      <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: badgeMap[variant] || "var(--text-primary)", marginTop: 2 }}>
        {count}
      </div>
    </div>
  );
}