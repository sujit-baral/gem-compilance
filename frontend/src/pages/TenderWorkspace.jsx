import { useState, useEffect } from "react";
import { listTenders, listApplications } from "../api/client";

export default function TenderWorkspace({ onApply, onTrackApplication, role = "bidder", bidderId = null }) {
  const [tenders, setTenders] = useState([]);
  const [bidderApplications, setBidderApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    setLoading(true);
    const tenderPromise = listTenders();
    const appPromise = (role === "bidder" && bidderId) ? listApplications(bidderId) : Promise.resolve([]);

    Promise.all([tenderPromise, appPromise])
      .then(([tenderData, appData]) => {
        setTenders(Array.isArray(tenderData) ? tenderData : []);
        setBidderApplications(Array.isArray(appData) ? appData : []);
        setError(null);
      })
      .catch(() => setError("Unable to load tenders from server."))
      .finally(() => setLoading(false));
  }, [role, bidderId]);

  const isOfficer = role === "officer";

  // Categories extracted from tenders
  const categories = ["all", ...new Set(tenders.map((t) => t.category).filter(Boolean))];

  const filteredTenders = tenders.map((t) => {
    const existingApp = bidderApplications.find((a) => a.tender_id === t.tender_id);
    return { ...t, existingApp };
  }).filter((t) => {
    const matchesSearch =
      (t.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.tender_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.category || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2>{isOfficer ? "Procurement Tenders Catalog" : "Open GeM Tenders"}</h2>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 2 }}>
            {isOfficer
              ? "All procurement tenders published on the platform."
              : "Explore live procurement opportunities and submit bids with automated compliance validation."}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search tender title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240, padding: "8px 12px", fontSize: 13 }}
          />

          {categories.length > 2 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: "auto", padding: "8px 12px", fontSize: 13 }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Loading Skeleton States */}
      {loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 18,
          }}
        >
          {[1, 2, 3].map((k) => (
            <div key={k} className="skeleton-card" style={{ height: 230 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="skeleton" style={{ height: 20, width: "40%" }} />
                <div className="skeleton" style={{ height: 20, width: "30%" }} />
              </div>
              <div className="skeleton" style={{ height: 24, width: "80%" }} />
              <div className="skeleton" style={{ height: 60, width: "100%" }} />
              <div className="skeleton" style={{ height: 36, width: "100%" }} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="badge badge-danger" style={{ width: "100%", padding: "12px 16px", fontSize: 13 }}>
          {error}
        </div>
      )}

      {!loading && !error && filteredTenders.length === 0 && (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "54px 20px",
            color: "var(--text-muted)",
            borderStyle: "dashed",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>📁</div>
          <h3 style={{ fontSize: 16, color: "var(--text-primary)" }}>No tenders found</h3>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            {search ? "No tenders matching your search criteria." : "No tenders are currently available."}
          </p>
        </div>
      )}

      {/* Tender Cards Grid */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 18,
          }}
        >
          {filteredTenders.map((tender) => (
            <TenderCard
              key={tender.tender_id}
              tender={tender}
              existingApp={tender.existingApp}
              onApply={onApply}
              onTrackApplication={onTrackApplication}
              isOfficer={isOfficer}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TenderCard({ tender, existingApp, onApply, onTrackApplication, isOfficer }) {
  const isApplied = Boolean(existingApp);

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        borderColor: isApplied ? "var(--info-border, #BFDBFE)" : "var(--border-subtle)",
        background: isApplied ? "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)" : "#FFFFFF",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = isApplied ? "var(--brand-accent)" : "var(--border-medium)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = isApplied ? "var(--info-border, #BFDBFE)" : "var(--border-subtle)";
        e.currentTarget.style.boxShadow = "var(--shadow-xs)";
      }}
    >
      <div>
        {/* Top Meta Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              fontWeight: 600,
              color: "var(--brand-accent)",
              background: "var(--brand-accent-subtle)",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
            }}
          >
            {tender.tender_id}
          </span>

          {/* Dynamic Status Badge */}
          {isApplied ? (
            existingApp.decision === "Qualified" ? (
              <span className="badge badge-success">✓ Qualified</span>
            ) : existingApp.decision === "Disqualified" ? (
              <span className="badge badge-danger">Disqualified</span>
            ) : existingApp.decision === "Clarification Requested" ? (
              <span className="badge badge-warning">Action Required</span>
            ) : existingApp.is_submitted ? (
              <span className="badge badge-info">✓ Applied (Under Review)</span>
            ) : (
              <span className="badge badge-purple">Draft in Progress</span>
            )
          ) : (
            <span className="badge badge-success">Open for Bidding</span>
          )}
        </div>

        {/* Title & Category */}
        <h3 style={{ fontSize: 16, marginBottom: 6, color: "var(--text-primary)" }}>
          {tender.title || "Untitled Tender"}
        </h3>

        {tender.category && (
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16 }}>
            Category: <strong style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{tender.category}</strong>
          </div>
        )}

        {/* Metrics Box */}
        <div
          style={{
            background: "var(--bg-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            marginBottom: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Estimated Value</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", marginTop: 1 }}>
              {tender.estimated_value ? `₹${Number(tender.estimated_value).toLocaleString("en-IN")}` : "Not Disclosed"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Deadline</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginTop: 1 }}>
              {tender.deadline || "Flexible"}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {!isOfficer ? (
        isApplied ? (
          <button
            type="button"
            className="secondary"
            onClick={() => onTrackApplication ? onTrackApplication(existingApp.application_id) : onApply(tender.tender_id)}
            style={{
              width: "100%",
              marginTop: 8,
              background: "#FFFFFF",
              borderColor: "var(--brand-accent)",
              color: "var(--brand-accent)",
              fontWeight: 600,
            }}
          >
            Track Submitted Bid &rarr;
          </button>
        ) : (
          <button
            type="button"
            className="primary"
            onClick={() => onApply(tender.tender_id)}
            style={{ width: "100%", marginTop: 8 }}
          >
            Apply to this Tender &rarr;
          </button>
        )
      ) : (
        <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", paddingTop: 8 }}>
          Published Tender &bull; Officer View Only
        </div>
      )}
    </div>
  );
}

