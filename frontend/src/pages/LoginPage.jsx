import { useState } from "react";
import { createBidder, findBidder } from "../api/client";

const OFFICER_USERNAME = "officer";
const OFFICER_PASSWORD = "gem2026";
const GMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState("bidder"); // "bidder" | "officer"

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "radial-gradient(ellipse at 50% 0%, #F1F5F9 0%, #F8FAFC 100%)",
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--radius-lg)",
            background: "var(--brand-primary)",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 18,
            marginBottom: 12,
            boxShadow: "var(--shadow-md)",
          }}
        >
          GeM
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          AI Compliance Platform
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 4 }}>
          Government e-Marketplace automated compliance &amp; verification
        </p>
      </div>

      {/* Main Login Card */}
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 440,
          boxShadow: "var(--shadow-lg)",
          borderRadius: "var(--radius-xl)",
          padding: 28,
        }}
      >
        {/* Role Segmented Switcher */}
        <div
          style={{
            display: "flex",
            background: "var(--bg-subtle)",
            padding: 3,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            marginBottom: 24,
          }}
        >
          <button
            type="button"
            onClick={() => setRole("bidder")}
            style={{
              flex: 1,
              background: role === "bidder" ? "#FFFFFF" : "transparent",
              color: role === "bidder" ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: role === "bidder" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              borderRadius: "var(--radius-sm)",
              padding: "7px 0",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
            }}
          >
            🏢 Bidder Portal
          </button>
          <button
            type="button"
            onClick={() => setRole("officer")}
            style={{
              flex: 1,
              background: role === "officer" ? "#FFFFFF" : "transparent",
              color: role === "officer" ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: role === "officer" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              borderRadius: "var(--radius-sm)",
              padding: "7px 0",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
            }}
          >
            🛡️ Officer Access
          </button>
        </div>

        {role === "officer" ? (
          <OfficerLoginForm onLogin={onLogin} />
        ) : (
          <BidderAuthForm onLogin={onLogin} />
        )}
      </div>

      <div style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
        Secure GeM Tender Verification &bull; AI Powered OCR &bull; ISO Compliant
      </div>
    </div>
  );
}

function OfficerLoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (username === OFFICER_USERNAME && password === OFFICER_PASSWORD) {
      onLogin({ role: "officer", name: "Procurement Officer" });
    } else {
      setError("Incorrect username or password.");
    }
  }

  function handleAutoFill() {
    setUsername(OFFICER_USERNAME);
    setPassword(OFFICER_PASSWORD);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 16 }}>Officer Sign In</h3>
        <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
          Access risk scores, cross-document verifications, and compliance audits.
        </p>
      </div>

      <label>Officer Username</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        required
      />

      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        required
      />

      {error && (
        <div
          className="badge badge-danger"
          style={{ width: "100%", padding: "8px 12px", marginTop: 12, fontSize: 12.5 }}
        >
          {error}
        </div>
      )}

      <button type="submit" className="primary" style={{ width: "100%", marginTop: 18 }}>
        Sign In as Officer
      </button>

      <div
        style={{
          marginTop: 16,
          padding: "10px 12px",
          background: "var(--bg-subtle)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12,
        }}
      >
        <span style={{ color: "var(--text-secondary)" }}>Demo: <code>officer</code> / <code>gem2026</code></span>
        <button
          type="button"
          onClick={handleAutoFill}
          style={{ background: "transparent", border: "none", color: "var(--brand-accent)", padding: 0, fontSize: 12 }}
        >
          Auto-fill
        </button>
      </div>
    </form>
  );
}

function BidderAuthForm({ onLogin }) {
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Register Form State
  const [form, setForm] = useState({ company_name: "", pan_number: "", email: "", phone: "" });
  const [created, setCreated] = useState(null);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const bidder = await findBidder(query.trim());
      onLogin({ role: "bidder", name: bidder.company_name, bidderId: bidder.bidder_id });
    } catch (err) {
      setError(err.message || "Bidder record not found. Please register your company.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setError("");

    if (!GMAIL_PATTERN.test(form.email.trim())) {
      setError("Please enter a valid Gmail address (ending in @gmail.com).");
      return;
    }

    setLoading(true);
    try {
      const response = await createBidder(form);
      if (!response.bidder_id) {
        setError(response.detail || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }
      setCreated(response);
    } catch {
      setError("Unable to connect to server. Please verify the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--success-bg)",
            color: "var(--success)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            marginBottom: 12,
          }}
        >
          ✓
        </div>
        <h3 style={{ fontSize: 17 }}>Registration Complete</h3>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
          Your permanent bidder credentials have been registered in the GeM database.
        </p>

        <div
          style={{
            background: "var(--bg-subtle)",
            border: "1px dashed var(--border-medium)",
            borderRadius: "var(--radius-md)",
            padding: 14,
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your Permanent Bidder ID
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: 2 }}>
            {created.bidder_id}
          </div>
        </div>

        <button
          type="button"
          className="primary"
          style={{ width: "100%" }}
          onClick={() => onLogin({ role: "bidder", name: form.company_name, bidderId: created.bidder_id })}
        >
          Proceed to Tender Workspace &rarr;
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Sub tabs: Log in vs Register */}
      <div style={{ display: "flex", gap: 12, borderBottom: "1px solid var(--border-subtle)", marginBottom: 18 }}>
        <button
          type="button"
          onClick={() => { setTab("login"); setError(""); }}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: tab === "login" ? "2px solid var(--brand-primary)" : "2px solid transparent",
            color: tab === "login" ? "var(--text-primary)" : "var(--text-muted)",
            borderRadius: 0,
            padding: "6px 4px 10px",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Existing Bidder Sign In
        </button>
        <button
          type="button"
          onClick={() => { setTab("register"); setError(""); }}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: tab === "register" ? "2px solid var(--brand-primary)" : "2px solid transparent",
            color: tab === "register" ? "var(--text-primary)" : "var(--text-muted)",
            borderRadius: 0,
            padding: "6px 4px 10px",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          New Registration
        </button>
      </div>

      {tab === "login" ? (
        <form onSubmit={handleLoginSubmit}>
          <label>Company PAN or Bidder ID</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. ABCDE1234F or BID-2026-XXXXXX"
            required
          />

          {error && (
            <div
              className="badge badge-danger"
              style={{ width: "100%", padding: "8px 12px", marginTop: 12, fontSize: 12.5 }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="primary" disabled={loading} style={{ width: "100%", marginTop: 18 }}>
            {loading ? "Verifying..." : "Sign In to Workspace"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit}>
          <label>Company / Legal Entity Name</label>
          <input
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            placeholder="e.g. ABC Enterprises Pvt Ltd"
            required
          />

          <label>Company PAN Number</label>
          <input
            value={form.pan_number}
            onChange={(e) => setForm({ ...form, pan_number: e.target.value.toUpperCase() })}
            placeholder="e.g. ABCDE1234F"
            maxLength={10}
            required
          />

          <label>Official Gmail Address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="authorized@gmail.com"
            required
          />

          <label>Contact Phone (Optional)</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98765 43210"
          />

          {error && (
            <div
              className="badge badge-danger"
              style={{ width: "100%", padding: "8px 12px", marginTop: 12, fontSize: 12.5 }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="primary" disabled={loading} style={{ width: "100%", marginTop: 18 }}>
            {loading ? "Registering..." : "Register & Get Bidder ID"}
          </button>
        </form>
      )}
    </div>
  );
}
