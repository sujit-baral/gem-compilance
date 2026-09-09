import { useState } from "react";
import { createBidder, findBidder } from "../api/client";

// Demo-only officer credentials — hardcoded on the frontend.
// This is fine for a hackathon prototype demo, but is NOT real
// authentication. A production version would verify this against
// the backend with a hashed password, not compare plain text in
// the browser.
const OFFICER_USERNAME = "officer";
const OFFICER_PASSWORD = "gem2026";

const GMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState(null); // null | "officer" | "bidder"

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--ink)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ color: "#fff", marginBottom: 6 }}>GeM Compliance Verification</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5 }}>
            AI-Powered Bid Compliance &amp; Verification Platform
          </p>
        </div>

        {!role && (
          <>
            <p
              style={{
                textAlign: "center",
                color: "rgba(255,255,255,0.4)",
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: "0.12em",
                marginBottom: 16,
              }}
            >
              WHO ARE YOU?
            </p>
            <div style={{ display: "flex", gap: 14 }}>
              <RoleCard
                title="BIDDER"
                desc="Submit bids and upload documents"
                icon={<BidderIcon />}
                iconBg="rgba(168,85,247,0.15)"
                buttonBg="var(--gold)"
                onClick={() => setRole("bidder")}
              />
              <RoleCard
                title="OFFICER"
                desc="Review bids and verify compliance"
                icon={<OfficerIcon />}
                iconBg="rgba(96,165,250,0.15)"
                buttonBg="rgba(255,255,255,0.12)"
                onClick={() => setRole("officer")}
              />
            </div>
          </>
        )}

        {role === "officer" && (
          <OfficerLogin onBack={() => setRole(null)} onLogin={onLogin} />
        )}

        {role === "bidder" && (
          <BidderLogin onBack={() => setRole(null)} onLogin={onLogin} />
        )}
      </div>
    </div>
  );
}

function RoleCard({ title, desc, icon, iconBg, buttonBg, onClick }) {
  return (
    <div
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "28px 18px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        {icon}
      </div>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "0.04em", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5, lineHeight: 1.4, marginBottom: 20, minHeight: 34 }}>
        {desc}
      </div>
      <button
        onClick={onClick}
        style={{
          width: "100%",
          padding: "9px 0",
          background: buttonBg,
          color: "#fff",
          border: "none",
          borderRadius: 7,
          fontSize: 13.5,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Login
      </button>
    </div>
  );
}

function BidderIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill="#C084FC" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#C084FC" />
    </svg>
  );
}

function OfficerIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l7 3v6c0 4.9-3 8.7-7 10-4-1.3-7-5.1-7-10V5l7-3z"
        fill="#60A5FA"
      />
      <path d="M9 12l2 2 4-4" stroke="#0F1B33" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OfficerLogin({ onBack, onLogin }) {
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

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <BackLink onBack={onBack} />
      <h3 style={{ marginTop: 8 }}>Officer sign in</h3>

      <label>Username</label>
      <input value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} required />

      <label>Password</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />

      {error && <p style={errorStyle}>{error}</p>}

      <button type="submit" style={submitStyle}>Sign in</button>
      <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 10 }}>
        Demo credentials — username: officer / password: gem2026
      </p>
    </form>
  );
}

function BidderLogin({ onBack, onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "register"

  return (
    <div style={cardStyle}>
      <BackLink onBack={onBack} />
      <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 18 }}>
        <TabButton active={mode === "login"} onClick={() => setMode("login")}>Log in</TabButton>
        <TabButton active={mode === "register"} onClick={() => setMode("register")}>Register</TabButton>
      </div>

      {mode === "login" ? (
        <BidderLoginForm onLogin={onLogin} />
      ) : (
        <BidderRegisterForm onLogin={onLogin} />
      )}
    </div>
  );
}

function BidderLoginForm({ onLogin }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const bidder = await findBidder(query.trim());
      onLogin({ role: "bidder", name: bidder.company_name, bidderId: bidder.bidder_id });
    } catch (err) {
      setError(err.message || "Could not find that bidder.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>PAN or Bidder ID</label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. ABCDE1234F or BID-000123"
        style={inputStyle}
        required
      />
      {error && <p style={errorStyle}>{error}</p>}
      <button type="submit" disabled={loading} style={submitStyle}>
        {loading ? "Checking..." : "Log in"}
      </button>
    </form>
  );
}

function BidderRegisterForm({ onLogin }) {
  const [form, setForm] = useState({ company_name: "", pan_number: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!GMAIL_PATTERN.test(form.email.trim())) {
      setError("Please enter a valid Gmail address (must end in @gmail.com).");
      return;
    }

    setLoading(true);
    try {
      const response = await createBidder(form);
      if (!response.bidder_id) {
        setError(response.detail || "Registration failed — please try again.");
        setLoading(false);
        return;
      }
      setCreated(response);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div>
        <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>Your Bidder ID (save this for future logins)</p>
          <p style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 600, fontFamily: "monospace" }}>{created.bidder_id}</p>
        </div>
        <button
          onClick={() => onLogin({ role: "bidder", name: form.company_name, bidderId: created.bidder_id })}
          style={submitStyle}
        >
          Continue to dashboard
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Company Name</label>
      <input name="company_name" value={form.company_name} onChange={handleChange} style={inputStyle} required />

      <label>PAN Number</label>
      <input name="pan_number" value={form.pan_number} onChange={handleChange} style={inputStyle} required />

      <label>Gmail Address</label>
      <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} placeholder="yourname@gmail.com" required />

      <label>Phone</label>
      <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} />

      {error && <p style={errorStyle}>{error}</p>}

      <button type="submit" disabled={loading} style={submitStyle}>
        {loading ? "Registering..." : "Register — get my Bidder ID"}
      </button>
    </form>
  );
}

function BackLink({ onBack }) {
  return (
    <button
      onClick={onBack}
      style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12.5, cursor: "pointer", padding: 0 }}
    >
      &larr; Choose a different role
    </button>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        flex: 1,
        padding: "8px 0",
        borderRadius: 6,
        border: "1px solid var(--border)",
        background: active ? "var(--ink)" : "var(--card)",
        color: active ? "#fff" : "var(--ink)",
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

const cardStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: 24,
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: 9,
  marginBottom: 14,
  marginTop: 4,
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 14,
  boxSizing: "border-box",
};

const submitStyle = {
  width: "100%",
  padding: "10px 0",
  background: "var(--gold)",
  color: "#ffffff",
  border: "none",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 4,
};

const errorStyle = {
  color: "var(--red)",
  fontSize: 13,
  marginTop: -6,
  marginBottom: 12,
};
