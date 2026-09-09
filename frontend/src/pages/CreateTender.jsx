import { useState } from "react";
import { createTender } from "../api/client";

export default function CreateTender({ onTenderCreated }) {
  const [form, setForm] = useState({
    title: "",
    category: "Electronics",
    description: "",
    estimated_value: "",
    submission_deadline: "",
    mse_only: false,
    make_in_india_required: false,
    min_local_content_percent: "",
    manpower_component: false,
    startup_exemption_allowed: false,
    oem_authorization_required: false,
    nsic_accepted: false,
    min_turnover: "",
    min_experience_years: "",
    created_by: "officer_demo",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      estimated_value: form.estimated_value === "" ? null : Number(form.estimated_value),
      min_local_content_percent: form.min_local_content_percent === "" ? null : Number(form.min_local_content_percent),
      min_turnover: form.min_turnover === "" ? null : Number(form.min_turnover),
      min_experience_years: form.min_experience_years === "" ? null : Number(form.min_experience_years),
    };

    try {
      const response = await createTender(payload);
      if (response.detail) {
        setError(response.detail);
      } else {
        setResult(response);
        if (onTenderCreated && response.tender_id) {
          onTenderCreated(response.tender_id);
        }
      }
    } catch {
      setError("Failed to create tender. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 840, margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h2>Create Procurement Tender</h2>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 2 }}>
          Define tender criteria, financial prerequisites, and automated document checklist rules.
        </p>
      </div>

      {result ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "var(--success-bg)",
              color: "var(--success)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              marginBottom: 16,
            }}
          >
            ✓
          </div>
          <h3 style={{ fontSize: 18 }}>Tender Created Successfully</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 13.5, marginTop: 4 }}>
            Tender Reference ID: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--brand-accent)" }}>{result.tender_id}</strong>
          </p>

          <div
            style={{
              margin: "24px auto",
              maxWidth: 540,
              background: "var(--bg-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: 20,
              textAlign: "left",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Generated Document Checklist ({result.checklist?.length || 0} items)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.checklist?.map((item, i) => (
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
                  <span style={{ fontWeight: 500 }}>{item.document_type}</span>
                  <span className={item.mandatory ? "badge badge-danger" : "badge badge-neutral"}>
                    {item.mandatory ? "Mandatory" : "Optional"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="secondary"
            onClick={() => {
              setResult(null);
              setForm((prev) => ({ ...prev, title: "", description: "" }));
            }}
          >
            + Create Another Tender
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Left Column: Basic Details */}
            <div className="card">
              <h3 style={{ fontSize: 15, marginBottom: 16 }}>1. Basic Tender Specifications</h3>

              <label>Tender Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Procurement of High Performance Laptops"
                required
              />

              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="Electronics">Electronics &amp; IT Hardware</option>
                <option value="Software">Software &amp; Cloud Services</option>
                <option value="Vehicles">Vehicles &amp; Transportation</option>
                <option value="Consulting">Consulting &amp; Professional Services</option>
                <option value="Medical">Medical Equipment &amp; Supplies</option>
                <option value="Construction">Construction &amp; Civil Works</option>
              </select>

              <label>Estimated Value (₹ INR)</label>
              <input
                type="number"
                name="estimated_value"
                value={form.estimated_value}
                onChange={handleChange}
                placeholder="e.g. 500000"
              />

              <label>Submission Deadline</label>
              <input
                type="date"
                name="submission_deadline"
                value={form.submission_deadline}
                onChange={handleChange}
              />

              <label>Tender Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Detailed scope of supply and deliverables..."
                rows={3}
              />
            </div>

            {/* Right Column: Criteria & Toggles */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card">
                <h3 style={{ fontSize: 15, marginBottom: 14 }}>2. Procurement Criteria &amp; Policy Toggles</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                  Selecting policies automatically generates mandatory document verification requirements.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { name: "mse_only", label: "MSE Only Tender", desc: "Requires Udyam Registration Certificate" },
                    { name: "make_in_india_required", label: "Make in India Required", desc: "Requires Local Content Certificate" },
                    { name: "manpower_component", label: "Manpower Component", desc: "Requires EPFO & ESIC Registrations" },
                    { name: "oem_authorization_required", label: "OEM Authorization Required", desc: "Requires OEM Auth Letter" },
                    { name: "startup_exemption_allowed", label: "Startup Exemption Allowed", desc: "Accepts DPIIT Certificate" },
                    { name: "nsic_accepted", label: "NSIC Accepted", desc: "Accepts NSIC Certificate" },
                  ].map((item) => (
                    <label
                      key={item.name}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: "var(--radius-md)",
                        background: form[item.name] ? "var(--brand-accent-subtle)" : "var(--bg-subtle)",
                        border: `1px solid ${form[item.name] ? "var(--info-border)" : "transparent"}`,
                        margin: 0,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        name={item.name}
                        checked={form[item.name]}
                        onChange={handleChange}
                        style={{ width: 16, height: 16, marginTop: 2, cursor: "pointer" }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.label}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: 15, marginBottom: 14 }}>3. Financial &amp; Experience Thresholds</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label>Min Turnover (₹)</label>
                    <input
                      type="number"
                      name="min_turnover"
                      value={form.min_turnover}
                      onChange={handleChange}
                      placeholder="e.g. 1000000"
                    />
                  </div>
                  <div>
                    <label>Min Experience (Years)</label>
                    <input
                      type="number"
                      name="min_experience_years"
                      value={form.min_experience_years}
                      onChange={handleChange}
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="badge badge-danger" style={{ width: "100%", padding: "10px 14px", marginTop: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
            <button type="submit" className="primary" disabled={loading} style={{ padding: "11px 28px", fontSize: 14 }}>
              {loading ? "Creating Tender..." : "Publish Tender & Rules"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}