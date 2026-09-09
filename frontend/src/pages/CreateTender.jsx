import { useState } from "react";
import { createTender } from "../api/client";

export default function CreateTender() {
  const [form, setForm] = useState({
    title: "",
    category: "",
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

    const payload = {
      ...form,
      estimated_value: form.estimated_value === "" ? null : Number(form.estimated_value),
      min_local_content_percent: form.min_local_content_percent === "" ? null : Number(form.min_local_content_percent),
      min_turnover: form.min_turnover === "" ? null : Number(form.min_turnover),
      min_experience_years: form.min_experience_years === "" ? null : Number(form.min_experience_years),
    };

    const response = await createTender(payload);
    setResult(response);
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Create Tender</h2>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required style={inputStyle} />

        <label>Category</label>
        <input name="category" value={form.category} onChange={handleChange} required style={inputStyle} />

        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} style={inputStyle} />

        <label>Estimated Value (₹)</label>
        <input type="number" name="estimated_value" value={form.estimated_value} onChange={handleChange} style={inputStyle} />

        <label>Submission Deadline</label>
        <input type="date" name="submission_deadline" value={form.submission_deadline} onChange={handleChange} style={inputStyle} />

               <div style={{ background: "#FFFFFF", border: "1px solid #E4E0D6", borderRadius: 8, padding: "14px 16px", marginTop: 16, marginBottom: 8 }}>
          {[
            { name: "mse_only", label: "MSE-only tender" },
            { name: "make_in_india_required", label: "Make in India required" },
            { name: "manpower_component", label: "Manpower/labour component" },
            { name: "startup_exemption_allowed", label: "Startup exemption allowed" },
            { name: "oem_authorization_required", label: "OEM authorization required" },
            { name: "nsic_accepted", label: "NSIC accepted" },
          ].map((item) => (
            <label
              key={item.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 400,
                color: "#101828",
                textTransform: "none",
                marginTop: 0,
                marginBottom: 10,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name={item.name}
                checked={form[item.name]}
                onChange={handleChange}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              {item.label}
            </label>
          ))}
        </div>

        <label>Minimum Turnover (₹)</label>
        <input type="number" name="min_turnover" value={form.min_turnover} onChange={handleChange} style={inputStyle} />

        <label>Minimum Experience (years)</label>
        <input type="number" name="min_experience_years" value={form.min_experience_years} onChange={handleChange} style={inputStyle} />

        <button type="submit" disabled={loading} style={{ marginTop: 16, padding: "8px 16px" }}>
          {loading ? "Creating..." : "Create Tender"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 24, background: "#f0f0f0", padding: 16, borderRadius: 8 }}>
          <h3>Tender Created: {result.tender_id}</h3>
          <h4>Generated Checklist:</h4>
          <ul>
            {result.checklist?.map((item, i) => (
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