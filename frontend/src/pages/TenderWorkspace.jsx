import { useState, useEffect } from "react";
import { listTenders } from "../api/client";

// Status badge colors — falls back to "Open" styling for any status
// string the backend doesn't explicitly map here.
const STATUS_STYLES = {
  Open: { bg: "#EAF6EE", text: "#1B7F4C" },
  Evaluation: { bg: "#EAF6EE", text: "#1B7F4C" },
  Review: { bg: "#EAF6EE", text: "#1B7F4C" },
  Awarded: { bg: "#EAF6EE", text: "#1B7F4C" },
  Closed: { bg: "#F3F4F6", text: "#6B7280" },
};

// role="bidder" (default) shows an "Apply" button on each card.
// role="officer" hides it — officers browse tenders, they don't bid.
export default function TenderWorkspace({ onApply, role = "bidder" }) {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listTenders()
      .then((data) => {
        setTenders(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch(() => setError("Could not load tenders. Check the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  const isOfficer = role === "officer";

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto" }}>
      <h2 style={{ marginBottom: 4 }}>{isOfficer ? "All Tenders" : "Tender Workspace"}</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28 }}>
        {isOfficer ? "Every tender created so far, most recent first" : "Live tenders open for bidding"}
      </p>

      {loading && <p style={{ color: "var(--text-muted)" }}>Loading tenders...</p>}
      {error && <p style={{ color: "var(--red)" }}>{error}</p>}
      {!loading && !error && tenders.length === 0 && (
        <p style={{ color: "var(--text-muted)" }}>
          {isOfficer ? "No tenders have been created yet." : "No tenders are open right now — check back soon."}
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {tenders.map((t) => (
          <TenderCard key={t.tender_id} tender={t} onApply={onApply} isOfficer={isOfficer} />
        ))}
      </div>
    </div>
  );
}

function TenderCard({ tender, onApply, isOfficer }) {
  const status = tender.status || "Open";
  const style = STATUS_STYLES[status] || STATUS_STYLES.Open;

  // These fields (verified_count, total_bids, deadline) may not exist
  // yet on the backend's tender object — the card degrades gracefully
  // and just omits that row if the data isn't there, rather than
  // showing "undefined".
  const hasProgress = typeof tender.verified_count === "number" && typeof tender.total_bids === "number";
  const progressPct = hasProgress && tender.total_bids > 0
    ? Math.round((tender.verified_count / tender.total_bids) * 100)
    : 0;

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ color: "#2563EB", fontWeight: 600, fontSize: 12.5, fontFamily: "monospace" }}>
          {tender.tender_id}
        </span>
        <span
          style={{
            background: style.bg,
            color: style.text,
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 9px",
            borderRadius: 20,
          }}
        >
          {status}
        </span>
      </div>

      <h3 style={{ fontSize: 16, margin: "4px 0 6px" }}>{tender.title || "Untitled tender"}</h3>
      <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16 }}>
        {tender.category ? `${tender.category} — ` : ""}Automated compliance verification workspace
      </p>

      {tender.estimated_value != null && (
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: -8, marginBottom: 16 }}>
          Estimated value: ₹{Number(tender.estimated_value).toLocaleString("en-IN")}
        </p>
      )}

        {hasProgress && (
        <>
          <div style={{ height: 6, background: "#EEF0F3", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "#1B7F4C" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-muted)", marginBottom: 14 }}>
            <span>{tender.verified_count}/{tender.total_bids} bids verified</span>
          </div>
        </>
      )}

     {tender.deadline && (
  <p
    style={{
      fontSize: 12.5,
      color: "var(--text-muted)",
      marginTop: -8,
      marginBottom: 16
    }}
  >
    Deadline:{" "}
    <strong
      style={{
        backgroundColor: "#fff3cd",
        color: "#856404",
        padding: "3px 6px",
        borderRadius: "4px"
      }}
    >
      {tender.deadline}
    </strong>
  </p>
)}

      {!isOfficer && (
        <button
          onClick={() => onApply(tender.tender_id)}
          style={{
            width: "100%",
            padding: "8px 0",
            background: "var(--ink)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Apply to this tender
        </button>
      )}
    </div>
  );
}
