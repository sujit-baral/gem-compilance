import { useState, useEffect } from "react";
import { checkHealth, BASE_URL } from "../api/client";

export default function BackendHealthIndicator() {
  const [status, setStatus] = useState("checking"); // "checking" | "online" | "waking" | "offline"
  const [latency, setLatency] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  async function pingBackend() {
    const startTime = performance.now();
    
    // If it takes longer than 2.5s, set status to waking so user gets visual feedback
    const wakeTimer = setTimeout(() => {
      setStatus((current) => (current === "online" ? current : "waking"));
    }, 2500);

    try {
      const res = await checkHealth();
      clearTimeout(wakeTimer);
      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed);
      setLastChecked(new Date());

      if (res && res.status === "healthy") {
        setStatus("online");
      } else {
        setStatus("offline");
      }
    } catch {
      clearTimeout(wakeTimer);
      setStatus("offline");
    }
  }

  useEffect(() => {
    // Initial pre-warm ping on website load
    pingBackend();

    // Heartbeat: Ping every 4.5 minutes (270,000 ms) to keep Render instance continuously warm
    const interval = setInterval(() => {
      pingBackend();
    }, 270000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        zIndex: 999,
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Floating Interactive Pill */}
      <div
        onClick={() => setShowDetails(!showDetails)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          padding: "5px 11px",
          borderRadius: "var(--radius-full)",
          fontSize: 11.5,
          fontWeight: 600,
          color: "var(--text-secondary)",
          cursor: "pointer",
          transition: "all 0.15s ease",
          userSelect: "none",
        }}
        title="Click to view backend health check status"
      >
        {/* Status Animated Indicator Dot */}
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background:
              status === "online"
                ? "var(--success)"
                : status === "waking"
                ? "var(--warning)"
                : status === "checking"
                ? "var(--info)"
                : "var(--danger)",
            boxShadow:
              status === "online"
                ? "0 0 0 2px rgba(16, 185, 129, 0.2)"
                : status === "waking"
                ? "0 0 0 3px rgba(245, 158, 11, 0.3)"
                : "none",
            animation: status === "waking" || status === "checking" ? "pulse 1.5s infinite" : "none",
          }}
        />

        {/* Text Status Label */}
        {status === "online" && (
          <span>
            Engine Ready {latency != null && <span style={{ color: "var(--text-muted)", fontSize: 10.5 }}>({latency}ms)</span>}
          </span>
        )}
        {status === "waking" && (
          <span style={{ color: "var(--warning)" }}>
            ⚡ Pre-warming backend (~30s)...
          </span>
        )}
        {status === "checking" && <span>Connecting backend...</span>}
        {status === "offline" && <span style={{ color: "var(--danger)" }}>Backend Offline</span>}
      </div>

      {/* Expanded Health & Render Diagnostic Popup */}
      {showDetails && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute",
            bottom: 36,
            left: 0,
            width: 280,
            background: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            padding: "14px 16px",
            fontSize: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 12.5, color: "var(--text-primary)" }}>Render Keep-Alive Guard</strong>
            <span
              className={status === "online" ? "badge badge-success" : "badge badge-warning"}
              style={{ fontSize: 10 }}
            >
              {status.toUpperCase()}
            </span>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: 11, lineHeight: 1.4, margin: "4px 0 10px" }}>
            Free cloud instances automatically sleep after 15m inactivity. This background keeper pings every 4.5m to maintain zero-delay responses.
          </p>

          <div style={{ background: "var(--bg-subtle)", padding: "8px 10px", borderRadius: 6, fontSize: 11, marginBottom: 10 }}>
            <div><strong>Endpoint:</strong> <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>/health</span></div>
            <div><strong>Latency:</strong> {latency ? `${latency} ms` : "—"}</div>
            <div><strong>Last Ping:</strong> {lastChecked ? lastChecked.toLocaleTimeString() : "Just now"}</div>
          </div>

          <button
            type="button"
            className="primary"
            onClick={pingBackend}
            style={{ width: "100%", fontSize: 11.5, padding: "6px 0" }}
          >
            ↻ Ping Server Now
          </button>
        </div>
      )}
    </div>
  );
}
