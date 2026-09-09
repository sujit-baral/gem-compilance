import { useState, useEffect } from "react";
import { listTenders } from "../api/client";

export default function TenderWorkspace({ onApply, role = "bidder" }) {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    listTenders()
      .then((data) => {
        setTenders(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch(() => setError("Unable to load tenders from server."))
      .finally(() => setLoading(false));
  }, []);

  const isOfficer = role === "officer";

  // Categories extracted from tenders
  const categories = ["all", ...new Set(tenders.map((t) => t.category).filter(Boolean))];

  const filteredTenders = tenders.filter((t) => {
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

      {/* Loading & Error States */}
      {loading && (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading active tenders...
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 18,
        }}
      >
        {filteredTenders.map((tender) => (
          <TenderCard key={tender.tender_id} tender={tender} onApply={onApply} isOfficer={isOfficer} />
        ))}
      </div>
    </div>
  );
}

function TenderCard({ tender, onApply, isOfficer }) {
  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = "var(--border-medium)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
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
          <span className="badge badge-success">Open for Bidding</span>
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
        <button
          type="button"
          className="primary"
          onClick={() => onApply(tender.tender_id)}
          style={{ width: "100%", marginTop: 8 }}
        >
          Apply to this Tender &rarr;
        </button>
      ) : (
        <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", paddingTop: 8 }}>
          Published Tender &bull; Officer View Only
        </div>
      )}
    </div>
  );
}
