import { useState, useEffect } from "react";
import { createApplication, listTenders } from "../api/client";

export default function StartApplication({
  onApplicationCreated,
  onChecklistReady,
  tenderId,
  setTenderId,
  bidderId,
  bidderName,
}) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    listTenders().then(setTenders);
  }, []);

  async function handleStartApplication() {
    if (!bidderId || !tenderId) return;
    setLoading(true);
    const response = await createApplication({
      tender_id: tenderId,
      bidder_id: bidderId,
    });

    if (response.detail) {
      alert("Error: " + response.detail);
      setLoading(false);
      return;
    }

    setApplication(response);
    if (onApplicationCreated && response.application?.application_id) {
      onApplicationCreated(response.application.application_id);
    }
    if (onChecklistReady && response.checklist) {
      onChecklistReady(response.checklist);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Apply to Tender</h2>

      <p style={{ color: "#6B7280", fontSize: 14 }}>
        Applying as <strong>{bidderName}</strong> ({bidderId})
      </p>

      {!application && (
        <div style={{ marginTop: 24 }}>
          <label>Select Tender to apply for</label>
          <select
            value={tenderId}
            onChange={(e) => setTenderId(e.target.value)}
            style={inputStyle}
          >
            <option value="">-- Select a tender --</option>
            {tenders.map((t) => (
              <option key={t.tender_id} value={t.tender_id}>
                {t.title} ({t.tender_id}) — {t.category}
              </option>
            ))}
          </select>

          <button onClick={handleStartApplication} disabled={loading || !tenderId} style={{ padding: "8px 16px" }}>
            {loading ? "Starting..." : "Start Application"}
          </button>
        </div>
      )}

      {application && (
        <div style={{ marginTop: 24, background: "#f0f0f0", padding: 16, borderRadius: 8 }}>
          <h3>Application Created</h3>
          <p><strong>Application ID:</strong> {application.application?.application_id}</p>
          <h4>Required Documents:</h4>
          <ul>
            {application.checklist?.map((item, i) => (
              <li key={i}>
                {item.document_type} {item.mandatory ? "(Mandatory)" : "(Optional)"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: 8,
  marginBottom: 12,
  marginTop: 4,
};