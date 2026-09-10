import { useState, useEffect } from "react";
import { listApplications } from "../api/client";
import { useToast } from "../context/ToastContext";

export default function BidderTracker({ bidderId, bidderName, onSelectApplication, goToUpload, goToApply }) {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  function fetchBids() {
    if (!bidderId) return;
    setLoading(true);
    setError(null);
    listApplications(bidderId)
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Unable to load your bid applications. Please check connection.");
        toast.error("Network Issue", "Unable to sync bid statuses.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchBids();
  }, [bidderId]);

  const counts = {
    total: applications.length,
    qualified: applications.filter((a) => a.decision === "Qualified").length,
    disqualified: applications.filter((a) => a.decision === "Disqualified").length,
    clarification: applications.filter((a) => a.decision === "Clarification Requested").length,
    inReview: applications.filter((a) => a.is_submitted && !a.decision).length,
    draft: applications.filter((a) => !a.is_submitted).length,
  };

  const filtered = applications.filter((a) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "qualified") return a.decision === "Qualified";
    if (filterStatus === "disqualified") return a.decision === "Disqualified";
    if (filterStatus === "clarification") return a.decision === "Clarification Requested";
    if (filterStatus === "submitted") return a.is_submitted && !a.decision;
    if (filterStatus === "draft") return !a.is_submitted;
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2>My Bid Applications &amp; Status Tracker</h2>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 2 }}>
            Track real-time progress, AI compliance scores, and official procurement decisions for <strong style={{ color: "var(--text-primary)" }}>{bidderName}</strong>.
          </p>
        </div>

        <button
          type="button"
          className="primary"
          onClick={goToApply}
          style={{ fontSize: 13, padding: "9px 18px" }}
        >
          + Apply for New Tender
        </button>
      </div>

      {/* Metric KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <TrackerStatCard
          label="Total Applications"
          count={counts.total}
          active={filterStatus === "all"}
          onClick={() => setFilterStatus("all")}
          color="var(--text-primary)"
        />
        <TrackerStatCard
          label="Qualified Bids"
          count={counts.qualified}
          active={filterStatus === "qualified"}
          onClick={() => setFilterStatus("qualified")}
          color="var(--success)"
        />
        <TrackerStatCard
          label="Action Required"
          count={counts.clarification}
          active={filterStatus === "clarification"}
          onClick={() => setFilterStatus("clarification")}
          color="var(--warning)"
          badge={counts.clarification > 0 ? "Inquiry" : null}
        />
        <TrackerStatCard
          label="Under Review"
          count={counts.inReview}
          active={filterStatus === "submitted"}
          onClick={() => setFilterStatus("submitted")}
          color="var(--info)"
        />
        <TrackerStatCard
          label="Draft / Uploading"
          count={counts.draft}
          active={filterStatus === "draft"}
          onClick={() => setFilterStatus("draft")}
          color="var(--text-muted)"
        />
      </div>

      {/* Loading Skeleton Placeholders */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2].map((k) => (
            <div key={k} className="skeleton-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div className="skeleton" style={{ height: 22, width: "35%" }} />
                <div className="skeleton" style={{ height: 20, width: "15%" }} />
              </div>
              <div className="skeleton" style={{ height: 16, width: "65%", marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 42, width: "100%" }} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="badge badge-danger" style={{ width: "100%", padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "54px 20px",
            borderStyle: "dashed",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontSize: 16, color: "var(--text-primary)" }}>No applications in this category</h3>
          <p style={{ fontSize: 13, marginTop: 4, maxWidth: 420, margin: "6px auto 18px" }}>
            {applications.length === 0
              ? "You haven't submitted any bid applications yet. Browse open tenders to apply."
              : "No bids match the selected filter."}
          </p>
          {applications.length === 0 && (
            <button type="button" className="primary" onClick={goToApply}>
              Browse Open Tenders &rarr;
            </button>
          )}
        </div>
      )}

      {/* Applications Tracker List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {filtered.map((app) => (
          <ApplicationTrackerCard
            key={app.application_id}
            app={app}
            onSelectApplication={onSelectApplication}
            goToUpload={goToUpload}
          />
        ))}
      </div>
    </div>
  );
}

function ApplicationTrackerCard({ app, onSelectApplication, goToUpload }) {
  // Determine lifecycle step (1 to 4)
  let currentStep = 1;
  if (app.uploaded_docs_count > 0) currentStep = 2;
  if (app.is_submitted) currentStep = 3;
  if (app.decision) currentStep = 4;

  const decisionColor =
    app.decision === "Qualified"
      ? "var(--success)"
      : app.decision === "Disqualified"
      ? "var(--danger)"
      : app.decision === "Clarification Requested"
      ? "var(--warning)"
      : "var(--info)";

  return (
    <div
      className="card"
      style={{
        borderLeft: `4px solid ${
          app.decision === "Qualified"
            ? "var(--success)"
            : app.decision === "Disqualified"
            ? "var(--danger)"
            : app.decision === "Clarification Requested"
            ? "var(--warning)"
            : app.is_submitted
            ? "var(--info)"
            : "var(--border-medium)"
        }`,
      }}
    >
      {/* Top Bar: Tender & App Meta */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--brand-accent)",
                background: "var(--brand-accent-subtle)",
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {app.application_id}
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Tender: <strong style={{ color: "var(--text-secondary)" }}>{app.tender_id}</strong>
            </span>
          </div>
          <h3 style={{ fontSize: 16, color: "var(--text-primary)", margin: 0 }}>
            {app.tender_title || "Procurement Tender Application"}
          </h3>
        </div>

        {/* Current Decision Pill */}
        <div style={{ textAlign: "right" }}>
          <span
            className={
              app.decision === "Qualified"
                ? "badge badge-success"
                : app.decision === "Disqualified"
                ? "badge badge-danger"
                : app.decision === "Clarification Requested"
                ? "badge badge-warning"
                : app.is_submitted
                ? "badge badge-info"
                : "badge badge-neutral"
            }
            style={{ fontSize: 13, padding: "5px 12px" }}
          >
            {app.decision || (app.is_submitted ? "Under Officer Review" : "Draft / Incomplete")}
          </span>
          {app.compliance_score != null && (
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
              Compliance Score: <strong style={{ color: "var(--text-primary)" }}>{app.compliance_score}%</strong> ({app.risk_level} Risk)
            </div>
          )}
        </div>
      </div>

      {/* Visual 4-Stage Progress Stepper */}
      <div
        style={{
          background: "var(--bg-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, position: "relative" }}>
          {[
            { step: 1, label: "1. Initialized", detail: "Checklist Generated" },
            {
              step: 2,
              label: "2. Documents",
              detail: `${app.uploaded_docs_count || 0}/${app.required_docs_count || 0} Uploaded`,
            },
            {
              step: 3,
              label: "3. Submission",
              detail: app.is_submitted ? "Submitted & Locked" : "Pending Submit",
            },
            {
              step: 4,
              label: "4. Officer Scrutiny",
              detail: app.decision || (app.is_submitted ? "In Evaluation" : "Awaiting Submit"),
            },
          ].map((s) => {
            const isCompleted = currentStep > s.step || (currentStep === 4 && s.step === 4);
            const isCurrent = currentStep === s.step && currentStep !== 4;
            return (
              <div key={s.step} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    margin: "0 auto 6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    background: isCompleted ? "var(--success)" : isCurrent ? "var(--brand-primary)" : "var(--border-subtle)",
                    color: isCompleted || isCurrent ? "#FFFFFF" : "var(--text-muted)",
                  }}
                >
                  {isCompleted ? "✓" : s.step}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: isCurrent || isCompleted ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                  {s.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clarification Alert Box (If Officer Requested Details) */}
      {app.decision === "Clarification Requested" && (
        <div
          style={{
            background: "var(--warning-bg)",
            border: "1px solid var(--warning-border)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--warning)" }}>
              ⚠️ Officer Clarification Inquiry:
            </div>
            <div style={{ fontSize: 13, color: "var(--text-primary)", marginTop: 3 }}>
              "{app.decision_reason || "Please review your submitted documents and provide updated certificates."}"
            </div>
            {app.decided_at && (
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                Logged on {new Date(app.decided_at).toLocaleString()}
              </div>
            )}
          </div>

          <button
            type="button"
            className="primary"
            onClick={() => {
              onSelectApplication(app.application_id);
              goToUpload();
            }}
            style={{ fontSize: 12.5, padding: "6px 14px", background: "var(--warning)" }}
          >
            Upload Requested Documents &rarr;
          </button>
        </div>
      )}

      {/* Disqualification Reason Box */}
      {app.decision === "Disqualified" && app.decision_reason && (
        <div
          style={{
            background: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--danger)" }}>
            Disqualification Justification:
          </div>
          <div style={{ fontSize: 13, color: "var(--text-primary)", marginTop: 3 }}>
            "{app.decision_reason}"
          </div>
        </div>
      )}

      {/* Qualification Celebration Box */}
      {app.decision === "Qualified" && (
        <div
          style={{
            background: "var(--success-bg)",
            border: "1px solid var(--success-border)",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            marginBottom: 16,
            fontSize: 12.5,
            color: "var(--success)",
            fontWeight: 600,
          }}
        >
          ✓ Bid Officially Qualified for Procurement Evaluation on {app.decided_at ? new Date(app.decided_at).toLocaleDateString() : "recently"}.
        </div>
      )}

      {/* Bottom Actions Footer */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            onSelectApplication(app.application_id);
            goToUpload();
          }}
          style={{ fontSize: 12.5, padding: "6px 14px" }}
        >
          {app.is_submitted ? "View Uploaded Documents" : "Continue Uploading & Submit &rarr;"}
        </button>
      </div>
    </div>
  );
}

function TrackerStatCard({ label, count, active, onClick, color, badge }) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: "14px 16px",
        borderColor: active ? "var(--brand-primary)" : "var(--border-subtle)",
        boxShadow: active ? "var(--shadow-md)" : "var(--shadow-xs)",
        transition: "all 0.15s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11.5, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
          {label}
        </div>
        {badge && (
          <span className="badge badge-warning" style={{ fontSize: 10 }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: color || "var(--text-primary)", marginTop: 4 }}>
        {count}
      </div>
    </div>
  );
}
