import React, { useState, useEffect } from "react";
import { uploadDocument, getApplicationDocuments, submitApplication, BASE_URL } from "../api/client";
import { useToast } from "../context/ToastContext";

const FALLBACK_DOCUMENT_TYPES = [
  "PAN Card",
  "GST Registration Certificate",
  "GST Returns",
  "Non-blacklisting Declaration",
  "Udyam Registration Certificate",
  "Make in India / Local Content Certificate",
  "EPFO Registration Certificate",
  "Turnover / Audited Financial Statements",
  "Experience Certificates",
  "Startup India (DPIIT) Certificate",
  "NSIC Registration Certificate",
  "OEM Authorization Letter",
];

const STEP_SEQUENCE = [
  "Uploading document to secure server...",
  "File stored and SHA-256 hash computed",
  "Running PyMuPDF & EasyOCR extraction...",
  "Classifying document structure & layout...",
  "Validating format patterns (PAN/GSTIN/Udyam)...",
  "Verifying against mock registry databases...",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function UploadDocuments({
  applicationId,
  setApplicationId,
  checklist,
}) {
  const toast = useToast();
  const [documentType, setDocumentType] = useState("");
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState("idle"); // "idle" | "processing" | "result"
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!applicationId) return;
    getApplicationDocuments(applicationId).then((docs) => {
      const latestByType = {};
      (docs || []).forEach((d) => {
        const existing = latestByType[d.document_type];
        if (!existing || new Date(d.upload_timestamp) > new Date(existing.upload_timestamp)) {
          latestByType[d.document_type] = d;
        }
      });
      setHistory(Object.values(latestByType));
    });
  }, [applicationId]);

  const documentTypes =
    checklist && checklist.length > 0
      ? checklist
      : FALLBACK_DOCUMENT_TYPES;

  async function handleUpload(e) {
    e.preventDefault();
    if (!applicationId || !documentType || !file) return;

    const alreadyUploaded = history.some((doc) => doc.document_type === documentType);
    if (alreadyUploaded) {
      const confirmReplace = window.confirm(
        `${documentType} is already uploaded. Do you want to replace it with this new file?`
      );
      if (!confirmReplace) return;
    }

    setPhase("processing");
    setVisibleSteps([]);
    setResult(null);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("application_id", applicationId);
    formData.append("document_type", documentType);
    formData.append("is_mandatory", "true");
    formData.append("file", file);

    const uploadPromise = uploadDocument(formData);

    // Progression animation
    for (let i = 0; i < STEP_SEQUENCE.length; i++) {
      await sleep(280);
      setVisibleSteps((prev) => [...prev, STEP_SEQUENCE[i]]);
    }

    try {
      const response = await uploadPromise;
      if (response.detail) {
        setErrorMsg(response.detail);
        toast.error("Verification Issue", response.detail);
        setPhase("idle");
        return;
      }

      await sleep(200);
      setResult(response);
      setHistory((prev) => [response, ...prev.filter((d) => d.document_type !== response.document_type)]);
      setPhase("result");
      toast.success("Document Verified", `${documentType} processed successfully.`);
    } catch {
      setErrorMsg("Upload failed due to connection error. Please try again.");
      toast.error("Upload Error", "Connection failed. Please retry.");
      setPhase("idle");
    }
  }

  async function handleSubmitApplication() {
    if (!applicationId) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await submitApplication(applicationId);
      if (res.detail) {
        setErrorMsg(res.detail);
        toast.error("Submission Incomplete", res.detail);
      } else {
        setSubmissionSuccess(true);
        toast.success("Application Submitted", "All mandatory documents verified and submitted for officer scrutiny.");
      }
    } catch {
      setErrorMsg("Submission error. Ensure all mandatory documents are uploaded.");
      toast.error("Submission Failed", "Please verify all mandatory certificates are uploaded.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2>Upload &amp; Verify Compliance Documents</h2>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 2 }}>
          Upload required certificates for instant AI-powered OCR extraction and registry validation.
        </p>
      </div>

      {/* Application ID Input Bar */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <label style={{ marginTop: 0 }}>Active Application Reference ID</label>
          <input
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
            placeholder="e.g. APP-2026-001-XXXXXX-XXXX"
            style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
          />
        </div>
        {applicationId && (
          <div style={{ alignSelf: "flex-end" }}>
            <span className="badge badge-info" style={{ padding: "6px 12px" }}>
              {history.length} Document(s) Uploaded
            </span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="badge badge-danger" style={{ width: "100%", padding: "10px 14px", marginBottom: 20, fontSize: 13 }}>
          {errorMsg}
        </div>
      )}

      {submissionSuccess && (
        <div
          style={{
            background: "var(--success-bg)",
            border: "1px solid var(--success-border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>
          <h3 style={{ color: "var(--success)" }}>Bid Application Submitted Successfully!</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
            Your bid has been submitted for official compliance review. The procurement officer can now evaluate your verification scores and decision status.
          </p>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="responsive-grid-2col">
        {/* Left Column: Upload Form & Live OCR Stepper */}
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Upload New Certificate</h3>

          {phase === "idle" && (
            <form onSubmit={handleUpload}>
              <label>Select Document Type *</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                required
                style={{ marginBottom: 16 }}
              >
                <option value="">-- Choose document type --</option>
                {documentTypes.map((item, i) => {
                  const name = item.document_type || item;
                  const isMandatory = item.mandatory;
                  const isUploaded = history.some((h) => h.document_type === name);
                  return (
                    <option key={i} value={name}>
                      {name} {isMandatory ? "(Mandatory)" : ""} {isUploaded ? "✓ Uploaded" : ""}
                    </option>
                  );
                })}
              </select>

              <label>Document File (PDF, JPG, PNG &bull; Max 5MB) *</label>
              <div
                style={{
                  border: "2px dashed var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  padding: "24px 16px",
                  textAlign: "center",
                  background: "var(--bg-subtle)",
                  cursor: "pointer",
                  marginBottom: 18,
                }}
                onClick={() => document.getElementById("file-upload-input").click()}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                  required
                />
                <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                  {file ? file.name : "Click to select or drag document file here"}
                </div>
                {file && (
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="primary"
                disabled={!applicationId || !documentType || !file}
                style={{ width: "100%", padding: "10px 0" }}
              >
                Upload &amp; Run AI Verification &rarr;
              </button>
            </form>
          )}

          {phase === "processing" && (
            <div style={{ padding: "12px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    border: "2px solid var(--brand-accent)",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <h4 style={{ fontSize: 14 }}>Processing &amp; Extracting Document...</h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {visibleSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="animate-fade-in"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12.5,
                      color: "var(--text-secondary)",
                      background: "var(--bg-subtle)",
                      padding: "6px 10px",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <span style={{ color: "var(--success)" }}>✓</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === "result" && result && (
            <div className="animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h4 style={{ fontSize: 15 }}>Verification Result</h4>
                <span className={statusBadgeClass(result.verification_status)}>
                  {result.verification_status || "Processed"}
                </span>
              </div>

              <div
                style={{
                  background: "var(--bg-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: 14,
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Uploaded Document</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{result.document_type}</div>

                {result.mismatch_details && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--danger)" }}>
                    <strong>Note:</strong> {result.mismatch_details}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setPhase("idle");
                  setFile(null);
                  setDocumentType("");
                }}
                style={{ width: "100%" }}
              >
                + Upload Another Document
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Uploaded Documents Repository & Final Submission */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 16 }}>Uploaded Documents ({history.length})</h3>
              <span className="badge badge-neutral">Auto-Synced</span>
            </div>

            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 10px", color: "var(--text-muted)", fontSize: 13 }}>
                No documents uploaded for this application yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {history.map((doc) => {
                  let extractedData = {};
                  try {
                    extractedData = doc.extracted_data ? JSON.parse(doc.extracted_data) : {};
                  } catch {
                    extractedData = {};
                  }

                  return (
                    <div
                      key={doc.document_id}
                      style={{
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: 12,
                        background: "var(--bg-surface)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                            {doc.document_type}
                          </div>
                          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                            {doc.document_id}
                          </div>
                        </div>
                        <span className={statusBadgeClass(doc.verification_status)}>
                          {doc.verification_status || "Uploaded"}
                        </span>
                      </div>

                      {/* Extracted Fields Badges */}
                      {Object.keys(extractedData).length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                          {Object.entries(extractedData).map(([k, v]) => {
                            if (!v || k === "raw_text_snippet" || k === "needs_manual_review") return null;
                            return (
                              <span
                                key={k}
                                style={{
                                  fontSize: 11,
                                  background: "var(--bg-subtle)",
                                  padding: "2px 6px",
                                  borderRadius: "var(--radius-sm)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                <strong>{k}:</strong> {String(v)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Final Submission Card */}
          {history.length > 0 && !submissionSuccess && (
            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)",
                borderColor: "var(--info-border)",
              }}
            >
              <h4 style={{ fontSize: 14, marginBottom: 4 }}>Ready for Final Submission?</h4>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 14 }}>
                Lock and submit your bid documents to trigger final compliance scoring by the procurement officer.
              </p>
              <button
                type="button"
                className="primary"
                onClick={handleSubmitApplication}
                disabled={submitting}
                style={{ width: "100%", padding: "10px 0" }}
              >
                {submitting ? "Submitting Application..." : "Submit Bid Application &rarr;"}
              </button>
            </div>
          )}
        </div>
      </div>
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