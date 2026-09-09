import { useState } from "react";
import { getDashboard, submitDecision, BASE_URL } from "../api/client";

// Fields we know how to label nicely. Anything else extracted (document
// type dependent — PAN cert vs GST cert vs Udyam pull different fields)
// still shows up, just with its raw key as the label.
const FIELD_LABELS = {
  pan: "PAN Number",
  gstin: "GSTIN",
  udyam_number: "Udyam Registration No.",
  entity_name: "Entity Name",
  turnover_amount: "Turnover Amount",
  experience_years: "Experience (years)",
  return_period: "Return Period",
};

function formatFieldLabel(key) {
  return FIELD_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Dashboard({ applicationId, setApplicationId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [decisionReason, setDecisionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchDashboard() {
    if (!applicationId) return;
    setLoading(true);
    const response = await getDashboard(applicationId);
    setData(response);
    setLoading(false);
  }

  async function handleDecision(decision) {
    setSubmitting(true);
    const response = await submitDecision(applicationId, {
      decision,
      decision_reason: decisionReason,
      decided_by: "officer_demo",
    });
    setData((prev) => ({ ...prev, decision: response.decision }));
    setSubmitting(false);
  }

  return (
    <div style={{ maxWidth: 650, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Compliance Dashboard</h2>

      <label>Application ID</label>
      <input
        value={applicationId}
        onChange={(e) => setApplicationId(e.target.value)}
        placeholder="e.g. APP-T189F34-2D8907-376C"
        style={inputStyle}
      />
      <button onClick={fetchDashboard} disabled={loading || !applicationId} style={{ padding: "8px 16px", marginTop: 8 }}>
        {loading ? "Loading..." : "Load Dashboard"}
      </button>

      {data && (
        <div style={{ marginTop: 30 }}>
          {/* Score cards */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
            <div style={cardStyle}>
              <div style={labelStyle}>Compliance Score</div>
              <div style={{ fontSize: 28, fontWeight: "bold" }}>{data.compliance_score}%</div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Risk Level</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: riskColor(data.risk_level) }}>
                {data.risk_level}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Decision</div>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>{data.decision || "Pending"}</div>
            </div>
          </div>

          {/* AI recommendation */}
          <div style={{ background: "#fff8e1", padding: 16, borderRadius: 8, marginBottom: 24 }}>
            <strong>AI Recommendation:</strong>
            <p style={{ margin: "8px 0 0" }}>{data.ai_recommendation}</p>
          </div>

                    {data.cross_document_check?.checked && (
            <div
              style={{
                background: data.cross_document_check.consistent ? "#e8f5e9" : "#fdecea",
                border: `1px solid ${data.cross_document_check.consistent ? "#2e7d32" : "#c62828"}`,
                padding: 16,
                borderRadius: 8,
                marginBottom: 24,
              }}
            >
              <strong>
                {data.cross_document_check.consistent
                  ? "✓ Cross-Document Consistency Check"
                  : "⚠ Cross-Document Mismatch Detected"}
              </strong>
              <p style={{ margin: "8px 0 4px" }}>{data.cross_document_check.note}</p>
              <p style={{ margin: "4px 0", fontSize: 13, color: "#555" }}>
                Reference entity name: <strong>{data.cross_document_check.reference_name}</strong>
              </p>
              {data.cross_document_check.mismatches.length > 0 && (
                <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                  {data.cross_document_check.mismatches.map((m, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#c62828" }}>
                      <strong>{m.document_type}</strong> shows "{m.extracted_name}" ({m.similarity_percent}% match)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Document table */}
          <h3>Document Status</h3>
          <div style={{ marginBottom: 24 }}>
            {data.documents?.map((doc) => (
              <div key={doc.document_id} style={docCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <strong style={{ fontSize: 15 }}>{doc.document_type}</strong>
                    {doc.is_mandatory && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: "#888" }}>(mandatory)</span>
                    )}
                  </div>
                  <span style={{ color: statusColor(doc.verification_status), fontWeight: "bold", fontSize: 13 }}>
                    {doc.verification_status || "Pending"}
                  </span>
                </div>

                {doc.mismatch_details && (
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "#a33" }}>{doc.mismatch_details}</p>
                )}

                {/* Extracted document fields — PAN, GSTIN, entity name, etc. */}
                {doc.extracted_data && Object.keys(doc.extracted_data).length > 0 && (
                  <div style={extractedGridStyle}>
                    {Object.entries(doc.extracted_data)
                      .filter(([key]) => key !== "raw_text_snippet" && key !== "needs_manual_review")
                      .map(([key, value]) => (
                        <div key={key}>
                          <div style={{ fontSize: 11, color: "#888" }}>{formatFieldLabel(key)}</div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{String(value)}</div>
                        </div>
                      ))}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <span style={{ fontSize: 13 }}>
                    {doc.is_duplicate ? (
                      <span style={{ color: "#c62828", fontWeight: "bold" }}>
                        ⚠ Also used in {doc.duplicate_of}
                      </span>
                    ) : (
                      <span style={{ color: "#2e7d32" }}>Unique document</span>
                    )}
                  </span>

                  {doc.file_url && (
                    <a
                      href={`${BASE_URL}${doc.file_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "#1565c0", fontWeight: 500 }}
                    >
                      View document &rarr;
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Officer decision */}
          <h3>Officer Decision</h3>
          <textarea
            placeholder="Reason (optional)"
            value={decisionReason}
            onChange={(e) => setDecisionReason(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 12 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => handleDecision("Qualified")} disabled={submitting} style={{ padding: "8px 16px", background: "#2e7d32", color: "white", border: "none" }}>
              Qualify
            </button>
            <button onClick={() => handleDecision("Clarification Requested")} disabled={submitting} style={{ padding: "8px 16px", background: "#f9a825", color: "white", border: "none" }}>
              Request Clarification
            </button>
            <button onClick={() => handleDecision("Disqualified")} disabled={submitting} style={{ padding: "8px 16px", background: "#c62828", color: "white", border: "none" }}>
              Disqualify
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function statusColor(status) {
  if (status === "Verified") return "#2e7d32";
  if (status === "Manual Review") return "#f9a825";
  if (status === "Not Found" || status === "Invalid" || status === "Insufficient" || status === "Error") return "#c62828";
  return "#888";
}

function riskColor(risk) {
  if (risk === "Low") return "#2e7d32";
  if (risk === "Medium") return "#f9a825";
  return "#c62828";
}

const cardStyle = {
  flex: 1,
  background: "#f5f5f5",
  padding: 16,
  borderRadius: 8,
  textAlign: "center",
};

const labelStyle = {
  fontSize: 13,
  color: "#666",
  marginBottom: 6,
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: 8,
  marginBottom: 12,
  marginTop: 4,
};

const docCardStyle = {
  border: "1px solid #e0e0e0",
  borderRadius: 8,
  padding: 14,
  marginBottom: 10,
};

const extractedGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: 10,
  background: "#fafafa",
  border: "1px solid #eee",
  borderRadius: 6,
  padding: 10,
  marginTop: 10,
};