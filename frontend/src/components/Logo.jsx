import React from "react";

export default function Logo({
  size = "md", // "sm" (28px) | "md" (34px) | "lg" (42px)
  showSubtitle = true,
  subtitle = "Compliance OS",
  tagline = "Automated Procurement Intelligence",
  onClick = null,
  isWhite = false,
}) {
  const dimensions = {
    sm: { box: 28, radius: 7, svg: 16, brandSize: 13, subSize: 9.5 },
    md: { box: 34, radius: 9, svg: 20, brandSize: 15, subSize: 11 },
    lg: { box: 44, radius: 12, svg: 26, brandSize: 18, subSize: 12 },
  }[size] || { box: 34, radius: 9, svg: 20, brandSize: 15, subSize: 11 };

  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size === "sm" ? 8 : 10,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        textDecoration: "none",
      }}
    >
      {/* High-Tech Vector Emblem */}
      <div
        style={{
          width: dimensions.box,
          height: dimensions.box,
          borderRadius: dimensions.radius,
          background: isWhite
            ? "#FFFFFF"
            : "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #2563EB 100%)",
          boxShadow: isWhite
            ? "0 2px 6px rgba(0,0,0,0.15)"
            : "0 2px 8px rgba(37, 99, 235, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Decorative Geometric Facet */}
        <div
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 14,
            height: 14,
            background: "rgba(37, 99, 235, 0.4)",
            filter: "blur(4px)",
            borderRadius: "50%",
          }}
        />

        <svg
          width={dimensions.svg}
          height={dimensions.svg}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Government Security Shield Outer Boundary */}
          <path
            d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z"
            stroke={isWhite ? "#0F172A" : "#FFFFFF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isWhite ? "rgba(15, 23, 42, 0.04)" : "rgba(255, 255, 255, 0.08)"}
          />
          {/* Central AI Verification Hex Node & Check */}
          <path
            d="M8.5 11.5L11 14L15.5 9"
            stroke={isWhite ? "#2563EB" : "#38BDF8"}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Glowing Top Node Accent */}
          <circle cx="12" cy="6" r="1.2" fill={isWhite ? "#2563EB" : "#10B981"} />
        </svg>
      </div>

      {/* Typography Brand Name & Subtitles */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: dimensions.brandSize,
              letterSpacing: "-0.03em",
              color: isWhite ? "#FFFFFF" : "var(--text-primary, #0F172A)",
              lineHeight: 1.1,
              fontFamily: "var(--font-sans)",
            }}
          >
            GeM
          </span>
          {subtitle && (
            <span
              style={{
                fontWeight: 700,
                fontSize: dimensions.brandSize * 0.92,
                letterSpacing: "-0.02em",
                color: isWhite ? "rgba(255, 255, 255, 0.9)" : "var(--brand-accent, #2563EB)",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              {subtitle}
            </span>
          )}
        </div>

        {showSubtitle && tagline && (
          <span
            className="landing-subtitle"
            style={{
              fontSize: dimensions.subSize,
              color: isWhite ? "rgba(255, 255, 255, 0.65)" : "var(--text-muted, #64748B)",
              marginTop: 1,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
