import { useState } from "react";
import LoginPage from "./LoginPage";

export default function LandingPage({ onLogin }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState("bidder");
  const [activeTab, setActiveTab] = useState("ocr"); // "ocr" | "entity" | "hash"

  function openAuth(role) {
    setAuthRole(role);
    setShowAuthModal(true);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFBFD", color: "#0F172A", overflowX: "hidden" }}>
      {/* Top Architectural Navigation */}
      <header
        className="landing-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 90,
          background: "rgba(250, 251, 253, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {/* Brand Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "#0F172A",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: "-0.04em",
                flexShrink: 0,
              }}
            >
              GeM
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: "-0.02em", color: "#0F172A", whiteSpace: "nowrap" }}>
                Compliance OS
              </span>
              <span className="landing-subtitle">
                Automated Procurement Intelligence
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => openAuth("officer")}
              style={{
                background: "transparent",
                color: "#334155",
                border: "1px solid #CBD5E1",
                padding: "6px 10px",
                fontSize: 11.5,
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              <span className="officer-btn-full">Officer Portal</span>
              <span className="officer-btn-short">Officer</span>
            </button>
            <button
              type="button"
              onClick={() => openAuth("bidder")}
              style={{
                background: "#0F172A",
                color: "#FFFFFF",
                border: "none",
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 600,
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.12)",
              }}
            >
              <span className="vendor-btn-full">Vendor Access &rarr;</span>
              <span className="vendor-btn-short">Vendor &rarr;</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section: 2-Column Asymmetric Layout */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 16px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "center" }}>
          {/* Left Column: Editorial Headline & Copy */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 10px",
                borderRadius: 999,
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
                fontSize: 11.5,
                fontWeight: 600,
                color: "#334155",
                marginBottom: 20,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Government e-Marketplace Verification Protocol
            </div>

            <h1
              style={{
                fontSize: "clamp(28px, 4.2vw, 48px)",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.035em",
                color: "#0F172A",
                marginBottom: 18,
              }}
            >
              Zero-lag bid compliance. <br />
              <span style={{ color: "#2563EB" }}>Zero manual scrutiny.</span>
            </h1>

            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.6,
                color: "#475569",
                marginBottom: 28,
                maxWidth: 490,
              }}
            >
              Autonomous document verification engine for public procurement tenders. Ingests PDFs &amp; certificate scans, executes multi-layer OCR, cross-validates legal entities, and calculates tamper-proof compliance scores in seconds.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => openAuth("bidder")}
                style={{
                  background: "#0F172A",
                  color: "#FFFFFF",
                  padding: "11px 20px",
                  fontSize: 13.5,
                  fontWeight: 600,
                  borderRadius: 10,
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
                }}
              >
                Submit Bid Documents &rarr;
              </button>
              <button
                type="button"
                onClick={() => openAuth("officer")}
                style={{
                  background: "#FFFFFF",
                  color: "#0F172A",
                  border: "1px solid #CBD5E1",
                  padding: "11px 18px",
                  fontSize: 13.5,
                  fontWeight: 600,
                  borderRadius: 10,
                }}
              >
                Launch Officer Demo
              </button>
            </div>

            {/* Micro Stats Bar */}
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                alignItems: "center",
                marginTop: 30,
                paddingTop: 20,
                borderTop: "1px solid #E2E8F0",
              }}
            >
              <div style={{ minWidth: 80 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>&lt; 1.2s</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>OCR Extraction</div>
              </div>
              <div style={{ width: 1, height: 24, background: "#E2E8F0" }} />
              <div style={{ minWidth: 80 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>100%</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>SHA-256 Guard</div>
              </div>
              <div style={{ width: 1, height: 24, background: "#E2E8F0" }} />
              <div style={{ minWidth: 80 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>12+</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>Certificates</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Visual Pipeline Display */}
          <div>
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                border: "1px solid #E2E8F0",
                boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
                padding: 24,
                position: "relative",
              }}
            >
              {/* Card Window Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 14,
                  marginBottom: 16,
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
                  <span style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#94A3B8", marginLeft: 8 }}>
                    engine: verified_pipeline.py
                  </span>
                </div>
                <span className="badge badge-success" style={{ fontSize: 10.5 }}>
                  Realtime Stream
                </span>
              </div>

              {/* Interactive Pipeline Mode Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  background: "#F8FAFC",
                  padding: 3,
                  borderRadius: 8,
                  marginBottom: 18,
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("ocr")}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    fontSize: 11.5,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: "none",
                    background: activeTab === "ocr" ? "#FFFFFF" : "transparent",
                    color: activeTab === "ocr" ? "#0F172A" : "#64748B",
                    boxShadow: activeTab === "ocr" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Neural OCR
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("entity")}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    fontSize: 11.5,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: "none",
                    background: activeTab === "entity" ? "#FFFFFF" : "transparent",
                    color: activeTab === "entity" ? "#0F172A" : "#64748B",
                    boxShadow: activeTab === "entity" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Entity Matcher
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("hash")}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    fontSize: 11.5,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: "none",
                    background: activeTab === "hash" ? "#FFFFFF" : "transparent",
                    color: activeTab === "hash" ? "#0F172A" : "#64748B",
                    boxShadow: activeTab === "hash" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Collusion Hash
                </button>
              </div>

              {/* Tab Content Display */}
              {activeTab === "ocr" && (
                <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div
                    style={{
                      background: "#F8FAFC",
                      borderRadius: 10,
                      padding: "12px 14px",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                        PAN Extraction Matrix
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#0F172A", marginTop: 2 }}>
                        ABCDE1234F
                      </div>
                    </div>
                    <span className="badge badge-success">Regex Validated</span>
                  </div>

                  <div
                    style={{
                      background: "#F8FAFC",
                      borderRadius: 10,
                      padding: "12px 14px",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                        GSTIN Registry Match
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#0F172A", marginTop: 2 }}>
                        27ABCDE1234F1Z5
                      </div>
                    </div>
                    <span className="badge badge-success">Active Taxpayer</span>
                  </div>

                  <div
                    style={{
                      background: "#F8FAFC",
                      borderRadius: 10,
                      padding: "12px 14px",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                        Udyam Classification
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#0F172A", marginTop: 2 }}>
                        UDYAM-MH-00-1234567
                      </div>
                    </div>
                    <span className="badge badge-info">Small Enterprise</span>
                  </div>
                </div>
              )}

              {activeTab === "entity" && (
                <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ padding: "12px 14px", background: "#ECFDF5", borderRadius: 10, border: "1px solid #A7F3D0" }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "#065F46" }}>
                      ✓ Cross-Document Legal Entity Alignment
                    </div>
                    <div style={{ fontSize: 12.5, color: "#047857", marginTop: 4 }}>
                      "Sample Technologies Pvt Ltd" extracted with <strong>100% Sequence Similarity</strong> across PAN, GST, and Udyam.
                    </div>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748B", padding: "6px 8px" }}>
                    Levenshtein Ratio: <strong style={{ color: "#0F172A" }}>1.00</strong> &bull; Fraud Risk: <strong style={{ color: "#059669" }}>0.00%</strong>
                  </div>
                </div>
              )}

              {activeTab === "hash" && (
                <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ padding: "12px 14px", background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>SHA-256 Digest</div>
                    <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#0F172A", wordBreak: "break-all", marginTop: 3 }}>
                      e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#059669" }}>
                    <span style={{ fontSize: 14 }}>✓</span>
                    <span>No identical file hashes detected across competing bidder applications.</span>
                  </div>
                </div>
              )}

              {/* Bottom Live Score Footer */}
              <div
                style={{
                  marginTop: 18,
                  paddingTop: 14,
                  borderTop: "1px solid #F1F5F9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 12, color: "#64748B" }}>Overall Compliance Score</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#059669" }}>91.7% Low Risk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: 4 Core Architectural Capabilities */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 16px 60px" }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#0F172A" }}>
            Engineered for High-Stakes Public Procurement
          </h2>
          <p style={{ fontSize: 13.5, color: "#64748B", marginTop: 4 }}>
            How our deep-learning OCR and rule engine replaces weeks of manual scrutiny.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#EFF6FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
              Dual-Layer Vision Pipeline
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55 }}>
              Automatically separates digital text PDFs from scanned photos. Applies Otsu adaptive binarization and passes imagery through PyTorch EasyOCR with character-level confusion correction (0/O, 1/I, 5/S).
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#ECFDF5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
              Cross-Certificate Matcher
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55 }}>
              Compares the legal company name across all uploaded certificates. Flags subtle spelling mismatches, shell company alterations, and data inconsistencies using Levenshtein distance calculations.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#FFFBEB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
              Collusion &amp; Duplicate Sentinel
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55 }}>
              Generates cryptographic SHA-256 fingerprints of every document. Prevents corrupt syndicates from uploading identical forged tax certificates under multiple shell bidder identities.
            </p>
          </div>

          {/* Card 4 */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#F5F3FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
              Dynamic Checklist Engine
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55 }}>
              Reads tender policy flags (MSE reservation, Make in India %, Min Turnover, Years Experience) and automatically serves bidders a custom checklist with mandatory vs. optional requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Dual-Portal Launcher */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px 64px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            borderRadius: 18,
            padding: "32px 20px",
            color: "#FFFFFF",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#93C5FD",
              }}
            >
              Ready to begin?
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF", margin: "8px 0 12px", letterSpacing: "-0.02em" }}>
              Launch your role workspace
            </h2>
            <p style={{ fontSize: 13.5, color: "#94A3B8", lineHeight: 1.5, maxWidth: 440 }}>
              Access the procurement compliance portal tailored specifically to your operational responsibilities.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              onClick={() => openAuth("bidder")}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 12,
                padding: "14px 16px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "background 0.15s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)")}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>Vendor / Bidder Workspace</div>
                <div style={{ fontSize: 11.5, color: "#94A3B8" }}>Browse open tenders, upload certificates, and track compliance</div>
              </div>
              <span style={{ fontSize: 16, color: "#FFFFFF" }}>&rarr;</span>
            </div>

            <div
              onClick={() => openAuth("officer")}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 12,
                padding: "14px 16px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "background 0.15s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)")}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>Procurement Officer Portal</div>
                <div style={{ fontSize: 11.5, color: "#94A3B8" }}>Publish tenders, evaluate risk matrices, review AI flags, and submit decisions</div>
              </div>
              <span style={{ fontSize: 16, color: "#FFFFFF" }}>&rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #E2E8F0",
          padding: "20px 16px",
          background: "#FFFFFF",
          fontSize: 11.5,
          color: "#94A3B8",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>GeM AI Compliance Verification Protocol &bull; 2026</div>
          <div style={{ display: "flex", gap: 14 }}>
            <span>FastAPI Backend</span>
            <span>PyTorch EasyOCR</span>
            <span>React Frontend</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal Popup */}
      {showAuthModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setShowAuthModal(false)}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 520,
              maxHeight: "92vh",
              overflowY: "auto",
              borderRadius: "var(--radius-xl)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                zIndex: 10,
                background: "#F1F5F9",
                border: "none",
                borderRadius: "50%",
                width: 30,
                height: 30,
                color: "#64748B",
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
            <LoginPage onLogin={onLogin} defaultRole={authRole} isModal={true} />
          </div>
        </div>
      )}
    </div>
  );
}
