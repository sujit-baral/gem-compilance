import React, { useState, useEffect } from "react";
import { uploadDocument, getApplicationDocuments, submitApplication } from "../api/client";

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
  "Uploading document...",
  "File uploaded",
  "Reading document with OCR...",
  "OCR extraction completed",
  "Checking document type...",
  "Checking required fields...",
  "Checking duplicate...",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function UploadDocuments({
  applicationId,
  setApplicationId,
  checklist,
}) {
  const [documentType, setDocumentType] = useState("");
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  
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

    if (!applicationId || !documentType || !file) {
      return;
    }

    // ---------------------------------------------------------
    // PREVENT UPLOADING THE SAME DOCUMENT TYPE TWICE
    // ---------------------------------------------------------

        const alreadyUploaded = history.some(
      (doc) => doc.document_type === documentType
    );

    if (alreadyUploaded) {
      const confirmReplace = window.confirm(
        `${documentType} already uploaded. Replace existing document?`
      );
      if (!confirmReplace) return;
    }

    setPhase("processing");
    setVisibleSteps([]);
    setResult(null);

    const formData = new FormData();

    formData.append("application_id", applicationId);
    formData.append("document_type", documentType);
    formData.append("is_mandatory", "true");
    formData.append("file", file);

    // Start the real backend request
    const uploadPromise = uploadDocument(formData);

    // Play processing animation
    for (let i = 0; i < STEP_SEQUENCE.length; i++) {
      await sleep(320);

      setVisibleSteps((prev) => [...prev, STEP_SEQUENCE[i]]);
    }

    const response = await uploadPromise;

    // ---------------------------------------------------------
    // HANDLE BACKEND ERROR
    // ---------------------------------------------------------

    if (response.detail) {
      alert("Upload failed: " + response.detail);

      setPhase("idle");
      setVisibleSteps([]);

      return;
    }

    await sleep(250);

    // Add document to history
    setResult(response);
    setHistory((prev) => [response, ...prev]);

    setPhase("result");
  }

  function handleUploadAnother() {
    setPhase("idle");
    setDocumentType("");
    setFile(null);
    setVisibleSteps([]);
    setResult(null);
  }

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
        padding: "0 20px",
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Upload Documents</h2>

      {/* ---------------------------------------------------------
          APPLICATION ID
      --------------------------------------------------------- */}

      <label>Application ID</label>

      <input
        value={applicationId}
        onChange={(e) => setApplicationId(e.target.value)}
        placeholder="e.g. APP-2026-002-1395ED-3B34"
        style={inputStyle}
      />

      {/* ---------------------------------------------------------
          MAIN TWO COLUMN AREA
      --------------------------------------------------------- */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: history.length > 0 ? "1fr 1fr" : "1fr",
          gap: 24,
          alignItems: "start",
          marginTop: 20,
        }}
      >
        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <div>
          {/* ---------------------------------------------------
              UPLOAD FORM
          --------------------------------------------------- */}

          {phase === "idle" && (
            <form onSubmit={handleUpload}>
              <label>Document Type</label>

              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">-- Select document type --</option>

                {documentTypes.map((item, i) => {
                  const label = item.document_type || item;
                  const mandatory = item.mandatory;

                  const alreadyUploaded = history.some(
                    (doc) => doc.document_type === label
                  );

                  return (
                    <option
                      key={i}
                      value={label}
                    >
                      {label}
                      {mandatory !== undefined
                        ? mandatory
                          ? " (Mandatory)"
                          : " (Optional)"
                        : ""}
                      {alreadyUploaded ? " - Uploaded" : ""}
                    </option>
                  );
                })}
              </select>

              <label>File</label>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files[0])}
                required
                style={{
                  marginBottom: 4,
                  marginTop: 4,
                }}
              />

              <div
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  marginBottom: 12,
                }}
              >
                Accepted formats: PDF, JPG, PNG — max size 5 MB
              </div>

              <button
                type="submit"
                style={{
                  padding: "9px 18px",
                  marginTop: 8,
                  cursor: "pointer",
                }}
              >
                Upload & Verify
              </button>
            </form>
          )}

          {/* ---------------------------------------------------
              PROCESSING
          --------------------------------------------------- */}

          {phase === "processing" && (
            <div
              style={{
                background: "#F5F5F5",
                border: "1px solid #E4E0D6",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <h3 style={{ marginTop: 0 }}>{documentType}</h3>

              {visibleSteps.map((step, i) => {
                const isLast = i === visibleSteps.length - 1;

                const isDone =
                  !isLast || visibleSteps.length === STEP_SEQUENCE.length;

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                      fontSize: 14,
                    }}
                  >
                    <span
                      style={{
                        color: isDone ? "#2e7d32" : "#888",
                      }}
                    >
                      {isDone ? "✓" : "⟳"}
                    </span>

                    <span
                      style={{
                        color: isDone ? "#101828" : "#6B7280",
                      }}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------------------------------------------------
              CURRENT RESULT
          --------------------------------------------------- */}

          {phase === "result" && result && (
            <ResultCard
              result={result}
              documentType={result.document_type || documentType}
              onUploadAnother={handleUploadAnother}
            />
          )}
        </div>

        {/* =====================================================
            RIGHT SIDE
            ONLY APPEARS AFTER FIRST SUCCESSFUL UPLOAD
        ===================================================== */}

        {history.length > 0 && (
          <ApplicationVerification
            history={history}
            checklist={documentTypes}
            applicationId={applicationId}
          />
        )}
      </div>

      {/* ---------------------------------------------------------
          PREVIOUSLY UPLOADED
      --------------------------------------------------------- */}

      {history.length > 1 && (
        <div style={{ marginTop: 32 }}>
          <h3>Previously Uploaded</h3>

          {history.slice(1).map((doc, i) => (
            <div
              key={i}
              style={{
                background: "#f0f0f0",
                padding: 10,
                borderRadius: 8,
                marginBottom: 8,
                borderLeft: `4px solid ${statusColor(
                  doc.verification_status
                )}`,
                fontSize: 13,
              }}
            >
              <strong>{doc.document_type}</strong>
              {" — "}
              {doc.verification_status || "Processed"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* =============================================================
   APPLICATION VERIFICATION
============================================================= */

function ApplicationVerification({ history, checklist, applicationId }) {
  /*
   * Count UNIQUE document types.
   *
   * PAN uploaded twice should still count as 1 document.
   */

  const uploadedTypes = [
    ...new Set(history.map((doc) => doc.document_type)),
  ];

  const totalDocuments = checklist.length;
  const uploadedCount = uploadedTypes.length;
  const pendingCount = Math.max(
    totalDocuments - uploadedCount,
    0
  );

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E4E0D6",
        borderRadius: 10,
        padding: 22,
        position: "sticky",
        top: 20,
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 18,
        }}
      >
        Application Verification
      </h3>

      {/* -------------------------------------------------------
          DOCUMENT COUNT
      ------------------------------------------------------- */}

      <div
        style={{
          borderBottom: "1px solid #E4E0D6",
          paddingBottom: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: "#6B7280",
            marginBottom: 5,
          }}
        >
          Documents
        </div>

        <div
          style={{
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          {uploadedCount} / {totalDocuments}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#6B7280",
            marginTop: 3,
          }}
        >
          documents uploaded
        </div>
      </div>

      {/* -------------------------------------------------------
          DOCUMENT LIST
      ------------------------------------------------------- */}

      <div>
        {uploadedTypes.map((type) => {
          const doc = history.find(
            (item) => item.document_type === type
          );

          return (
            <VerificationDocument
              key={type}
              document={doc}
            />
          );
        })}
      </div>

      {/* -------------------------------------------------------
          PENDING DOCUMENTS
      ------------------------------------------------------- */}

      {pendingCount > 0 && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid #E4E0D6",
            fontSize: 13,
            color: "#6B7280",
          }}
        >
          {pendingCount} document
          {pendingCount !== 1 ? "s" : ""} pending
        </div>
      )}

      {/* -------------------------------------------------------
          ALL DOCUMENTS COMPLETE
      ------------------------------------------------------- */}

      {pendingCount === 0 && totalDocuments > 0 && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid #E4E0D6",
          }}
        >
          <div
            style={{
              color: "#2e7d32",
              fontWeight: "bold",
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            ✓ All required documents uploaded
          </div>
          <SubmitButton applicationId={applicationId} />
        </div>
      )}
    </div>
  );
}

function SubmitButton({ applicationId }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    const response = await submitApplication(applicationId);
    if (response.detail) {
      alert("Could not submit: " + response.detail);
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div style={{ background: "#EAF6EE", color: "#1B7F4C", padding: "10px 12px", borderRadius: 6, fontSize: 13, fontWeight: "bold", textAlign: "center" }}>
        ✓ Application Submitted
      </div>
    );
  }

  return (
    <button
      onClick={handleSubmit}
      disabled={submitting}
      style={{ width: "100%", padding: "10px 0", background: "#101828", color: "#fff", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer" }}
    >
      {submitting ? "Submitting..." : "Submit Application"}
    </button>
  );
}

/* =============================================================
   SINGLE DOCUMENT IN VERIFICATION PANEL
============================================================= */

function VerificationDocument({ document }) {
  const status = document?.verification_status || "Processed";

  const isVerified = status === "Verified";
  const isManual = status === "Manual Review";

  const symbol = isVerified
    ? "✓"
    : isManual
    ? "!"
    : "✕";

  const color = isVerified
    ? "#2e7d32"
    : isManual
    ? "#f9a825"
    : "#c62828";

  return (
    <div
      style={{
        padding: "10px 0",
        borderBottom: "1px solid #F0F0F0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
        }}
      >
        <span
          style={{
            color,
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          {symbol}
        </span>

        <span
          style={{
            fontWeight: 500,
          }}
        >
          {document.document_type}
        </span>
      </div>

      <div
        style={{
          marginLeft: 24,
          marginTop: 3,
          fontSize: 12,
          color,
        }}
      >
        {status}
      </div>
    </div>
  );
}


/* =============================================================
   RESULT CARD
============================================================= */

function ResultCard({
  result,
  documentType,
  onUploadAnother,
}) {
  let extracted = {};

  try {
    extracted = result.extracted_data
      ? JSON.parse(result.extracted_data)
      : {};
  } catch (e) {
    extracted = {};
  }

  const typeMatchOk =
    result.verification_status !== "Type Mismatch";

  const ocrOk = !extracted.error;

  const fieldsOk =
    !extracted.needs_manual_review && typeMatchOk;

  const duplicateOk = !result.is_duplicate;

  const checks = [
    {
      label: "Document Type",
      ok: typeMatchOk,
      okText: "Correct",
      failText: "Mismatch",
    },
    {
      label: "OCR Extraction",
      ok: ocrOk,
      okText: "Completed",
      failText: "Failed",
    },
    {
      label: "Required Fields",
      ok: fieldsOk,
      okText: "Found",
      failText: "Missing",
    },
    {
      label: "Duplicate Check",
      ok: duplicateOk,
      okText: "Passed",
      failText: "Flagged",
    },
  ];

  const statusIsGood =
    result.verification_status === "Verified";

  const statusIsWarn =
    result.verification_status === "Manual Review";

  const statusColorHex = statusIsGood
    ? "#2e7d32"
    : statusIsWarn
    ? "#f9a825"
    : "#c62828";

  const statusLabel =
    result.verification_status || "Processed";

  const fieldEntries = Object.entries(extracted).filter(
    ([key]) =>
      ![
        "raw_text_snippet",
        "needs_manual_review",
        "error",
      ].includes(key)
  );

  return (
    <div
      style={{
        marginTop: 28,
        background: "#FFFFFF",
        border: "1px solid #E4E0D6",
        borderRadius: 10,
        padding: 22,
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 16,
        }}
      >
        {documentType}
      </h3>

      {/* CHECKS */}

      {checks.map((c, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 0",
            fontSize: 14,
          }}
        >
          <span>
            <span
              style={{
                color: c.ok ? "#2e7d32" : "#c62828",
                marginRight: 8,
              }}
            >
              {c.ok ? "✓" : "✕"}
            </span>

            {c.label}
          </span>

          <span
            style={{
              color: c.ok ? "#2e7d32" : "#c62828",
              fontWeight: "bold",
            }}
          >
            {c.ok ? c.okText : c.failText}
          </span>
        </div>
      ))}

      {/* STATUS */}

      <div
        style={{
          borderTop: "1px solid #E4E0D6",
          marginTop: 14,
          paddingTop: 14,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#6B7280",
            marginBottom: 4,
          }}
        >
          Verification Status
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: statusColorHex,
          }}
        >
          {statusIsGood
            ? "✓"
            : statusIsWarn
            ? "!"
            : "✕"}{" "}
          {statusLabel}
        </div>

        {result.mismatch_details && (
          <div
            style={{
              fontSize: 13,
              color: "#c62828",
              marginTop: 6,
            }}
          >
            {result.mismatch_details}
          </div>
        )}

        {result.is_duplicate && (
          <div
            style={{
              fontSize: 13,
              color: "#c62828",
              marginTop: 6,
            }}
          >
            Duplicate found in application{" "}
            {result.duplicate_of}
          </div>
        )}
      </div>

      {/* EXTRACTED INFORMATION */}

      {fieldEntries.length > 0 && (
        <div
          style={{
            borderTop: "1px solid #E4E0D6",
            marginTop: 14,
            paddingTop: 14,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginBottom: 8,
            }}
          >
            Extracted Information
          </div>

          {fieldEntries.map(([key, value]) => (
            <div
              key={key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                padding: "4px 0",
                gap: 10,
              }}
            >
              <span
                style={{
                  color: "#6B7280",
                  textTransform: "capitalize",
                }}
              >
                {key.replace(/_/g, " ")}
              </span>

              <span
                style={{
                  fontWeight: "bold",
                  textAlign: "right",
                }}
              >
                {String(value ?? "-")}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onUploadAnother}
        style={{
          marginTop: 18,
          padding: "8px 16px",
          cursor: "pointer",
        }}
      >
        Upload Another Document
      </button>
    </div>
  );
}


/* =============================================================
   STATUS COLOR
============================================================= */

function statusColor(status) {
  if (status === "Verified") {
    return "#2e7d32";
  }

  if (status === "Manual Review") {
    return "#f9a825";
  }

  if (
    status === "Not Found" ||
    status === "Invalid" ||
    status === "Insufficient" ||
    status === "Error" ||
    status === "Type Mismatch"
  ) {
    return "#c62828";
  }

  return "#888";
}


/* =============================================================
   INPUT STYLE
============================================================= */

const inputStyle = {
  display: "block",
  width: "100%",
  padding: 9,
  marginBottom: 12,
  marginTop: 4,
  boxSizing: "border-box",
};