/**
 * Sample Document Generator Utility
 * Generates realistic government certificate mock images/blobs (PAN, GSTIN, Udyam, ITR)
 * for 1-click demo testing without requiring local files.
 */

export const DEMO_PRESETS = [
  {
    id: "pan",
    docType: "PAN Card",
    title: "Permanent Account Number (PAN)",
    filename: "sample_pan_card.png",
    entity: "Sample Technologies Pvt Ltd",
    keyField: "ABCDE1234F",
    tag: "Tax Identity",
    color: "#1E3A8A",
  },
  {
    id: "gst",
    docType: "GST Registration Certificate",
    title: "GSTIN Certificate (REG-06)",
    filename: "sample_gst_certificate.png",
    entity: "Sample Technologies Pvt Ltd",
    keyField: "27ABCDE1234F1Z5",
    tag: "Indirect Tax",
    color: "#065F46",
  },
  {
    id: "udyam",
    docType: "Udyam Registration Certificate",
    title: "Udyam MSME Certificate",
    filename: "sample_udyam_msme.png",
    entity: "Sample Technologies Pvt Ltd",
    keyField: "UDYAM-MH-00-1234567",
    tag: "MSME Privilege",
    color: "#78350F",
  },
  {
    id: "turnover",
    docType: "Turnover / Audited Financial Statements",
    title: "CA Audited Turnover Statement",
    filename: "sample_turnover_itr.png",
    entity: "Sample Technologies Pvt Ltd",
    keyField: "INR 50,00,000",
    tag: "Financials",
    color: "#4C1D95",
  },
];

/**
 * Renders a realistic mock certificate on an HTML5 canvas and returns a File object.
 */
export async function generateDemoCertificateFile(presetId) {
  const preset = DEMO_PRESETS.find((p) => p.id === presetId) || DEMO_PRESETS[0];

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 760;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#FAFBFD";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative Border
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.strokeStyle = preset.color;
  ctx.lineWidth = 8;
  ctx.strokeRect(28, 28, canvas.width - 56, 12);

  // Header Banner
  ctx.fillStyle = preset.color;
  ctx.fillRect(36, 44, canvas.width - 72, 80);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GOVERNMENT OF INDIA • OFFICIAL VERIFICATION RECORD", canvas.width / 2, 80);

  ctx.font = "bold 20px sans-serif";
  ctx.fillText(preset.title.toUpperCase(), canvas.width / 2, 110);

  // Watermark / Seal
  ctx.fillStyle = "rgba(15, 23, 42, 0.03)";
  ctx.font = "bold 90px sans-serif";
  ctx.fillText("GOVT OF INDIA", canvas.width / 2, 420);

  // Content Fields
  ctx.textAlign = "left";
  ctx.fillStyle = "#334155";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("Legal Entity Name:", 80, 200);

  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 28px monospace";
  ctx.fillText(preset.entity, 80, 240);

  // Main Identifier Box
  ctx.fillStyle = "#F1F5F9";
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 2;
  ctx.fillRect(80, 280, canvas.width - 160, 110);
  ctx.strokeRect(80, 280, canvas.width - 160, 110);

  ctx.fillStyle = "#475569";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText(preset.docType.toUpperCase() + " IDENTIFIER:", 110, 320);

  ctx.fillStyle = preset.color;
  ctx.font = "bold 36px monospace";
  ctx.fillText(preset.keyField, 110, 365);

  // Additional details
  ctx.fillStyle = "#475569";
  ctx.font = "18px sans-serif";
  ctx.fillText("Issued Date: 01/01/2026", 80, 440);
  ctx.fillText("Status: ACTIVE & VERIFIED TAXPAYER", 80, 475);
  ctx.fillText("Registration Authority: Central Registry Protocol (GeM-AI)", 80, 510);

  if (preset.id === "pan") {
    ctx.fillText("Income Tax Department • Government of India", 80, 560);
    ctx.fillText("Permanent Account Number: " + preset.keyField, 80, 595);
  } else if (preset.id === "gst") {
    ctx.fillText("Goods and Services Tax Identification Number: " + preset.keyField, 80, 560);
    ctx.fillText("Taxpayer Type: Regular • State: Maharashtra (27)", 80, 595);
  } else if (preset.id === "udyam") {
    ctx.fillText("Enterprise Type: Small Enterprise • Major Activity: Services", 80, 560);
    ctx.fillText("Udyam Registration No: " + preset.keyField, 80, 595);
  } else if (preset.id === "turnover") {
    ctx.fillText("Annual Gross Turnover (FY 2024-2025): " + preset.keyField, 80, 560);
    ctx.fillText("Audited by: Chartered Accountants of India", 80, 595);
  }

  // Footer Stamp
  ctx.fillStyle = "#64748B";
  ctx.font = "italic 16px sans-serif";
  ctx.fillText("Digitally signed and cryptographically verified for GeM Compliance Evaluation.", 80, 680);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], preset.filename, { type: "image/png" });
      resolve({ file, preset });
    }, "image/png");
  });
}
