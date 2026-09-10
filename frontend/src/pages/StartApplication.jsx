import { useState, useEffect } from "react";
import { createApplication, listTenders } from "../api/client";
import { useToast } from "../context/ToastContext";

export default function StartApplication({
  onApplicationCreated,
  onChecklistReady,
  tenderId,
  setTenderId,
  bidderId,
  bidderName,
  goToUpload,
}) {
  const toast = useToast();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tenders, setTenders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listTenders().then((data) => setTenders(Array.isArray(data) ? data : []));
  }, []);

  async function handleStartApplication() {
    if (!bidderId || !tenderId) return;
    setLoading(true);
    setError("");

    try {
      const response = await createApplication({
        tender_id: tenderId,
        bidder_id: bidderId,
      });

      if (response.detail) {
        setError(response.detail);
        toast.error("Application Failed", response.detail);
        setLoading(false);
        return;
      }

      setApplication(response);
      toast.success("Application Initialized", `ID: ${response.application?.application_id}`);
      if (onApplicationCreated && response.application?.application_id) {
        onApplicationCreated(response.application.application_id);
      }
      if (onChecklistReady && response.checklist) {
        onChecklistReady(response.checklist);
      }
    } catch {
      setError("Failed to create application. Please check your backend connection.");
      toast.error("Network Error", "Unable to start application.");
    } finally {
      setLoading(false);
    }
  }

  const selectedTender = tenders.find((t) => t.tender_id === tenderId);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2>Start Tender Bid Application</h2>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 2 }}>
          Applying as <strong style={{ color: "var(--text-primary)" }}>{bidderName}</strong> (
          <code style={{ fontFamily: "var(--font-mono)" }}>{bidderId}</code>)
        </p>
      </div>

      {!application ? (
        <div className="card">
          <label>Select Target Tender *</label>
          <select
            value={tenderId}
            onChange={(e) => setTenderId(e.target.value)}
            style={{ marginBottom: 16 }}
          >
            <option value="">-- Choose a tender to apply for --</option>
            {tenders.map((t) => (
              <option key={t.tender_id} value={t.tender_id}>
                {t.title} ({t.tender_id}) &bull; {t.category}
              </option>
            ))}
          </select>

          {selectedTender && (
            <div
              style={{
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                marginBottom: 20,
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>Selected Tender Details</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                {selectedTender.title}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12.5, color: "var(--text-secondary)" }}>
                <span>ID: <code style={{ fontFamily: "var(--font-mono)" }}>{selectedTender.tender_id}</code></span>
                <span>Category: <strong>{selectedTender.category}</strong></span>
                {selectedTender.estimated_value && (
                  <span>Value: <strong>₹{Number(selectedTender.estimated_value).toLocaleString("en-IN")}</strong></span>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="badge badge-danger" style={{ width: "100%", padding: "10px 14px", marginBottom: 16, fontSize: 12.5 }}>
              {error}
            </div>
          )}

          <button
            type="button"
            className="primary"
            onClick={handleStartApplication}
            disabled={loading || !tenderId}
            style={{ width: "100%", padding: "11px 0" }}
          >
            {loading ? "Initializing Application..." : "Initialize Bid & Generate Document Checklist &rarr;"}
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "var(--success-bg)",
              color: "var(--success)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              marginBottom: 14,
            }}
          >
            ✓
          </div>
          <h3 style={{ fontSize: 18 }}>Bid Application Initialized</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
            Application ID: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--brand-accent)" }}>{application.application?.application_id}</strong>
          </p>

          <div
            style={{
              margin: "20px auto",
              background: "var(--bg-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: 18,
              textAlign: "left",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Required Compliance Documents ({application.checklist?.length || 0})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {application.checklist?.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#FFFFFF",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: 13,
                  }}
                >
                  <span>{item.document_type}</span>
                  <span className={item.mandatory ? "badge badge-danger" : "badge badge-neutral"}>
                    {item.mandatory ? "Mandatory" : "Optional"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="primary"
            onClick={goToUpload}
            style={{ width: "100%", padding: "11px 0" }}
          >
            Proceed to Document Upload &amp; Verification &rarr;
          </button>
        </div>
      )}
    </div>
  );
}