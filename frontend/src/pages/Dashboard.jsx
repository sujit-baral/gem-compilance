import { useState } from "react";
import { getDashboard, submitDecision, BASE_URL } from "../api/client";

const FIELD_LABELS = {
  pan: "PAN Number",
  pan_number: "PAN Number",
  gstin: "GSTIN",
  udyam_number: "Udyam Reg. No.",
  entity_name: "Entity Name",
  turnover_amount: "Turnover (INR)",
  experience_years: "Experience (Years)",
  return_period: "GST Return Period",
  declaration_present: "Self-Declaration",
  oem_auth_number: "OEM Auth ID",
  mii_certificate_number: "MII Cert ID",
  epfo_number: "EPFO Reg No.",
  dpiit_number: "DPIIT Reg No.",
  nsic_number: "NSIC Reg No.",
};

function formatFieldLabel(key) {
  return FIELD_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Dashboard({ applicationId, setApplicationId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [decisionReason, setDecisionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchDashboard() {
    if (!applicationId) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await getDashboard(applicationId.trim());
      if (response.detail) {
        setErrorMsg(response.detail);
        setData(null);
      } else {
        setData(response);
      }
    } catch {
      setErrorMsg("Failed to load application data. Please check ID.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(decision) {
    if (!applicationId) return;
    setSubmitting(true);
    try {
      const response = await submitDecision(applicationId, {
        decision,
        decision_reason: decisionReason,
        decided_by: "officer_demo",
      });
      setData((prev) => ({ ...prev, decision: response.decision }));
    } catch {
      alert("Failed to submit decision.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2>Compliance Evaluation Dashboard</h2>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 2 }}>
          Officer review workspace for AI compliance scoring, cross-document verification, and eligibility decisions.
        </p>
      </div>

      {/* Query Bar */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <label style={{ marginTop: 0 }}>Application ID</label>
          <input
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
            placeholder="e.g. APP-2026-001-XXXXXX-XXXX"
            style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
          />
        </div>
        <button
          type="button"
          className="primary"
          onClick={fetchDashboard}
          disabled={loading || !applicationId}
          style={{ alignSelf: "flex-end", height: 40 }}
        >
          {loading ? "Analyzing..." : "Evaluate Application"}
        </button>
      </div>

      {errorMsg && (
        <div className="badge badge-danger" style={{ width: "100%", padding: "10px 14px", marginBottom: 20, fontSize: 13 }}>
          {errorMsg}
        </div>
      )}

      {data && (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top KPI Metric Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {/* Score Card */}
            <div className="card">
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Compliance Score
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>
                {data.compliance_score != null ? `${data.compliance_score}%` : "—"}
              </div>
              <div style={{ height: 6, background: "var(--bg-subtle)", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${data.compliance_score || 0}%`,
                    background: data.compliance_score >= 85 ? "var(--success)" : data.compliance_score >= 60 ? "var(--warning)" : "var(--danger)",
                  }}
                />
              </div>
            </div>

            {/* Risk Card */}
            <div className="card">
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Assessed Risk Level
              </div>
              <div style={{ marginTop: 8 }}>
                <span
                  className={
                    data.risk_level === "Low"
                      ? "badge badge-success"
                      : data.risk_level === "Medium"
                      ? "badge badge-warning"
                      : "badge badge-danger"
                  }
                  style={{ fontSize: 15, padding: "6px 14px" }}
                >
                  {data.risk_level || "Pending"} Risk
                </span>
              </div>
            </div>

            {/* Decision Status */}
            <div className="card">
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Officer Decision
              </div>
              <div style={{ marginTop: 8 }}>
                <span
                  className={
                    data.decision === "Qualified"
                      ? "badge badge-success"
                      : data.decision === "Disqualified"
                      ? "badge badge-danger"
                      : data.decision === "Clarification Requested"
                      ? "badge badge-warning"
                      : "badge badge-neutral"
                  }
                  style={{ fontSize: 14, padding: "6px 12px" }}
                >
                  {data.decision || "Pending Decision"}
                </span>
              </div>
            </div>
          </div>

          {/* AI Recommendation Banner */}
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
              borderLeft: "4px solid var(--brand-accent)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>🤖</span>
              <h4 style={{ fontSize: 14, color: "var(--text-primary)" }}>AI Compliance Engine Analysis</h4>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 4 }}>
              {data.ai_recommendation || "No recommendation available."}
            </p>
          </div>

          {/* Cross-Document Entity Consistency */}
          {data.cross_document_check?.checked && (
            <div
              className="card"
              style={{
                backgroundColor: data.cross_document_check.consistent ? "var(--success-bg)" : "var(--danger-bg)",
                borderColor: data.cross_document_check.consistent ? "var(--success-border)" : "var(--danger-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>
                  {data.cross_document_check.consistent ? "✓" : "⚠️"}
                </span>
                <h4 style={{ color: data.cross_document_check.consistent ? "var(--success)" : "var(--danger)", fontSize: 14 }}>
                  {data.cross_document_check.consistent
                    ? "Cross-Document Entity Names Matched"
                    : "Entity Name Discrepancy Detected Across Certificates"}
                </h4>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>
                {data.cross_document_check.note}
              </p>
              {data.cross_document_check.reference_name && (
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>
                  Reference Legal Name: <strong>{data.cross_document_check.reference_name}</strong>
                </div>
              )}
            </div>
          )}

          {/* Documents Evaluation Table */}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Submitted Documents ({data.documents?.length || 0})</h3>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>Extracted Key Data</th>
                    <th>Status</th>
                    <th>File Link</th>
                  </tr>
                </thead>
                <tbody>
                  {data.documents?.map((doc) => (
                    <tr key={doc.document_id}>
                      <td style={{ fontWeight: 600 }}>{doc.document_type}</td>
                      <td>
                        {doc.extracted_data && Object.keys(doc.extracted_data).length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {Object.entries(doc.extracted_data).map(([k, v]) => {
                              if (!v || k === "raw_text_snippet" || k === "needs_manual_review") return null;
                              return (
                                <span
                                  key={k}
                                  style={{
                                    fontSize: 11,
                                    background: "var(--bg-subtle)",
                                    padding: "2px 6px",
                                    borderRadius: "var(--radius-sm)",
                                  }}
                                >
                                  <strong>{formatFieldLabel(k)}:</strong> {String(v)}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={statusBadgeClass(doc.verification_status)}>
                          {doc.verification_status || "Processed"}
                        </span>
                        {doc.mismatch_details && (
                          <div style={{ fontSize: 11, color: "var(--danger)", marginTop: 4 }}>
                            {doc.mismatch_details}
                          </div>
                        )}
                      </td>
                      <td>
                        {doc.file_url ? (
                          <a
                            href={`${BASE_URL}${doc.file_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--brand-accent)", textDecoration: "none", fontSize: 12.5, fontWeight: 600 }}
                          >
                            View File &nearr;
                          </a>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Officer Decision Panel */}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Submit Official Procurement Decision</h3>

            <label>Decision Notes / Audit Justification</label>
            <textarea
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              placeholder="Provide justification for qualification, disqualification, or clarification inquiry..."
              rows={2}
              style={{ marginBottom: 16 }}
            />

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                className="primary"
                onClick={() => handleDecision("Qualified")}
                disabled={submitting}
                style={{ background: "var(--success)" }}
              >
                ✓ Qualify Bidder
              </button>

              <button
                type="button"
                className="danger"
                onClick={() => handleDecision("Disqualified")}
                disabled={submitting}
              >
                ✕ Disqualify Bidder
              </button>

              <button
                type="button"
                className="secondary"
                onClick={() => handleDecision("Clarification Requested")}
                disabled={submitting}
              >
                💬 Request Clarification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function statusBadgeClass(status) {
  if (status === "Verified") return "badge badge-success";
  if (status === "Manual Review") return "badge badge-warning";
  if (status === "Invalid" || status === "Insufficient" || status === "Type Mismatch" || status === "Not Found")
    return "badge badge-danger";
  return "badge badge-neutral";
}