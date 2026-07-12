"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ─── */
interface QuoteConfig {
  productName: string;
  size:         string | null;
  qty:          number | string;
  method:       "embroidery" | "print" | "both" | null;
  positions:    string[];
  fileName:     string | null;
  notes:        string;
  basePerUnit:  number;
  brandingCost: number;
  totalPerUnit: number;
  totalOrder:   number;
}

interface QuoteModalProps {
  config:   QuoteConfig;
  onClose:  () => void;
}

/* ─── Generate reference ─── */
function genRef() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `ELV-${ts.slice(-4)}${rnd}`;
}

/* ─── Generate printable HTML ─── */
function buildPrintHTML(config: QuoteConfig, customer: Record<string, string>, ref: string) {
  const ts = new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });
  const method = config.method === "embroidery" ? "Embroidery"
    : config.method === "print" ? "Print" : "Both (Embroidery + Print)";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Elevate Workwear — Quote ${ref}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Helvetica Neue',Arial,sans-serif;color:#111;padding:48px;max-width:800px;margin:0 auto}
  .logo{font-size:24px;font-weight:700;letter-spacing:2px;color:#0041F9;margin-bottom:4px}
  .sub{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:32px}
  h2{font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#0041F9;margin:28px 0 12px;padding-bottom:6px;border-bottom:1px solid #e5e7eb}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px 32px;margin-bottom:8px}
  .field label{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888;display:block;margin-bottom:3px}
  .field span{font-size:13px;color:#111}
  .ref-box{background:#f0f4ff;border:1px solid #c7d7ff;border-radius:4px;padding:16px 20px;margin:24px 0}
  .ref-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#0041F9;margin-bottom:4px}
  .ref-num{font-size:20px;font-weight:700;letter-spacing:3px;color:#0041F9}
  .total-row{display:flex;justify-content:space-between;padding:10px 16px;background:#f9fafb;border:1px solid #e5e7eb;margin-top:8px}
  .total-label{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#555}
  .total-val{font-size:18px;font-weight:700;color:#111}
  .footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#999;display:flex;justify-content:space-between}
  @media print{body{padding:32px}}
</style>
</head>
<body>
  <div class="logo">ELEVATE</div>
  <div class="sub">Workwear Solutions · Quote Request</div>

  <div class="ref-box">
    <div class="ref-label">Reference Number</div>
    <div class="ref-num">${ref}</div>
  </div>

  <h2>Customer Details</h2>
  <div class="grid">
    <div class="field"><label>Company</label><span>${customer.company}</span></div>
    <div class="field"><label>Contact Name</label><span>${customer.contact}</span></div>
    <div class="field"><label>Email</label><span>${customer.email}</span></div>
    <div class="field"><label>Phone</label><span>${customer.phone}</span></div>
    ${customer.title ? `<div class="field"><label>Job Title</label><span>${customer.title}</span></div>` : ""}
    ${customer.website ? `<div class="field"><label>Website</label><span>${customer.website}</span></div>` : ""}
    <div class="field"><label>Delivery Postcode</label><span>${customer.postcode}</span></div>
  </div>

  <h2>Product Configuration</h2>
  <div class="grid">
    <div class="field"><label>Product</label><span>${config.productName}</span></div>
    <div class="field"><label>Size</label><span>${config.size ?? "—"}</span></div>
    <div class="field"><label>Quantity</label><span>${config.qty} units</span></div>
    <div class="field"><label>Branding Method</label><span>${method}</span></div>
    <div class="field"><label>Logo Position(s)</label><span>${config.positions.join(", ") || "None"}</span></div>
    ${config.fileName ? `<div class="field"><label>Logo File</label><span>${config.fileName}</span></div>` : ""}
    ${config.notes ? `<div class="field" style="grid-column:1/-1"><label>Notes</label><span>${config.notes}</span></div>` : ""}
    ${customer.addNotes ? `<div class="field" style="grid-column:1/-1"><label>Additional Notes</label><span>${customer.addNotes}</span></div>` : ""}
  </div>

  <h2>Pricing Breakdown</h2>
  <div class="grid">
    <div class="field"><label>Base Price / Unit</label><span>On Quote</span></div>
    <div class="field"><label>Branding Cost / Unit</label><span>£${config.brandingCost.toFixed(2)}</span></div>
    <div class="field"><label>Total / Unit</label><span>On Quote</span></div>
    <div class="field"><label>Quantity</label><span>${config.qty} units</span></div>
  </div>
  <div class="total-row">
    <div class="total-label">Estimated Order Total</div>
    <div class="total-val">On Quote</div>
  </div>

  <div class="footer">
    <span>Elevate Workwear Solutions · info@elevateworkwear.com</span>
    <span>${ts}</span>
  </div>
</body>
</html>`;
}

/* ─── Shared UI primitives ─── */
function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <p style={{
      fontFamily: "var(--font-jetbrains,monospace)",
      fontSize: "0.52rem", letterSpacing: "0.16em", textTransform: "uppercase",
      color: "rgba(255,255,255,0.38)", marginBottom: 6,
    }}>
      {children}{required && <span style={{ color: "#0041F9", marginLeft: 3 }}>*</span>}
    </p>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  padding: "10px 14px", outline: "none", color: "rgba(255,255,255,0.8)",
  fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.875rem", lineHeight: 1.5,
  transition: "border-color 0.2s",
};

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={inputStyle}
      onFocus={e => { e.target.style.borderColor = "rgba(0,65,249,0.6)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} placeholder={placeholder} rows={rows}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, resize: "vertical" }}
      onFocus={e => { e.target.style.borderColor = "rgba(0,65,249,0.6)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
    />
  );
}

/* ─── Summary row ─── */
function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)" }}>
        {label}
      </span>
      <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.82rem", color: accent ? "#F5F5F3" : "rgba(255,255,255,0.55)", textAlign:"right", maxWidth:"55%" }}>
        {value}
      </span>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   MAIN MODAL
═════════════════════════════════════════════════════════════════ */
export default function QuoteModal({ config, onClose }: QuoteModalProps) {
  const [company,   setCompany  ] = useState("");
  const [contact,   setContact  ] = useState("");
  const [email,     setEmail    ] = useState("");
  const [phone,     setPhone    ] = useState("");
  const [title,     setTitle    ] = useState("");
  const [website,   setWebsite  ] = useState("");
  const [postcode,  setPostcode ] = useState("");
  const [addNotes,  setAddNotes ] = useState("");
  const [errors,    setErrors   ] = useState<Record<string, string>>({});
  const [submitting,setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sendFailed,setSendFailed] = useState(false);
  const [copied,    setCopied    ] = useState(false);
  const [ref,       setRef      ] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!company.trim())  e.company  = "Required";
    if (!contact.trim())  e.contact  = "Required";
    if (!email.trim())    e.email    = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!phone.trim())    e.phone    = "Required";
    if (!postcode.trim()) e.postcode = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setSubmitting(true);

    const reference = genRef();
    setRef(reference);

    const method = config.method === "embroidery" ? "Embroidery"
      : config.method === "print" ? "Print" : "Both (Embroidery + Print)";

    const body = [
      `QUOTE REQUEST — ${reference}`,
      `Date: ${new Date().toLocaleString("en-GB")}`,
      ``,
      `── CUSTOMER DETAILS ──`,
      `Company: ${company}`,
      `Contact: ${contact}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      ...(title    ? [`Job Title: ${title}`]      : []),
      ...(website  ? [`Website: ${website}`]      : []),
      `Delivery Postcode: ${postcode}`,
      ...(addNotes ? [`Notes: ${addNotes}`]       : []),
      ``,
      `── PRODUCT CONFIGURATION ──`,
      `Product: ${config.productName}`,
      `Size: ${config.size ?? "—"}`,
      `Quantity: ${config.qty} units`,
      `Branding Method: ${method}`,
      `Logo Position(s): ${config.positions.join(", ") || "None"}`,
      ...(config.fileName ? [`Logo File: ${config.fileName} (sent separately)`] : []),
      ...(config.notes    ? [`Product Notes: ${config.notes}`]                  : []),
      ``,
      `── PRICING ──`,
      `Base Price/Unit: on quote`,
      `Branding Cost/Unit: +£${config.brandingCost.toFixed(2)}`,
      `Total/Unit: on quote`,
      `Estimated Order Total: on quote`,
    ].join("\n");

    const payload = {
      company, contact, email, phone, title, website, postcode, addNotes,
      productName:  config.productName,
      size:         config.size,
      qty:          config.qty,
      method:       config.method,
      positions:    config.positions,
      fileName:     config.fileName,
      notes:        config.notes,
      basePerUnit:  config.basePerUnit,
      brandingCost: config.brandingCost,
      totalPerUnit: config.totalPerUnit,
      totalOrder:   config.totalOrder,
      reference,
    };

    /* ── Try 1: Resend via /api/quote ── */
    let sent = false;
    try {
      const res = await fetch("/api/quote", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (res.ok) sent = true;
      else console.warn("Resend failed:", await res.text());
    } catch (e) {
      console.warn("Resend request failed:", e);
    }

    /* ── Try 2: Formspree fallback ── */
    if (!sent) {
      const formspreeUrl = process.env.NEXT_PUBLIC_FORMSPREE_URL;
      if (formspreeUrl) {
        try {
          const res2 = await fetch(formspreeUrl, {
            method:  "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body:    JSON.stringify({ ...payload, _subject: `Quote Request — ${reference} — ${company}` }),
          });
          if (res2.ok) sent = true;
          else console.warn("Formspree failed:", await res2.text());
        } catch (e) {
          console.warn("Formspree request failed:", e);
        }
      }
    }

    setSubmitting(false);

    if (sent) {
      setSubmitted(true);
    } else {
      /* ── All providers failed: show copy-to-clipboard fallback ── */
      setSendFailed(true);
      setSubmitted(true);   // still show confirmation screen with fallback notice
    }
  }, [company, contact, email, phone, title, website, postcode, addNotes, config]);

  const handlePrint = useCallback(() => {
    const customer = { company, contact, email, phone, title, website, postcode, addNotes };
    const html = buildPrintHTML(config, customer, ref);
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
  }, [company, contact, email, phone, title, website, postcode, addNotes, config, ref]);

  const method = config.method === "embroidery" ? "Embroidery"
    : config.method === "print" ? "Print"
    : config.method === "both" ? "Embroidery + Print" : "—";

  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="relative w-full max-h-[92vh] overflow-y-auto"
        style={{
          maxWidth: 780,
          margin: "0 16px",
          background: "#0A0A0E",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
        }}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        exit={{   opacity: 0, y: 16, scale: 0.98  }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(0,65,249,0.75)", marginBottom:4 }}>
              Elevate Workwear Solutions
            </p>
            <h2 style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.6rem", letterSpacing:"0.06em", color:"#F5F5F3", lineHeight:1 }}>
              {submitted ? "Enquiry Received" : "Request Detailed Quote"}
            </h2>
          </div>
          <button onClick={onClose} className="cursor-pointer flex items-center justify-center"
            style={{ width:32, height:32, border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color="#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.4)"; }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ══════════════════════════════════════
            CONFIRMATION SCREEN
        ══════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="confirm"
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}
              className="flex flex-col items-center text-center px-8 py-12 gap-6"
            >
              {/* Tick */}
              <div className="w-14 h-14 rounded-full bg-blue flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 11L9 16L18 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div>
                <h3 style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.8rem", letterSpacing:"0.05em", color:"#F5F5F3", marginBottom:12, lineHeight:1 }}>
                  Thank You For Your Enquiry
                </h3>
                <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.92rem", color:"rgba(255,255,255,0.5)", lineHeight:1.8, maxWidth:480, margin:"0 auto" }}>
                  Your quote request has been received and a member of the Elevate Workwear team
                  will review your artwork and contact you shortly.
                </p>
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.6rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", marginTop:12 }}>
                  Typical response time: within 5 hours
                </p>

              {/* ── Send-failed fallback ── */}
              {sendFailed && (
                <motion.div
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  style={{ marginTop:12, padding:"14px 18px", border:"1px solid rgba(255,165,0,0.35)", background:"rgba(255,140,0,0.06)", maxWidth:480 }}
                >
                  <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,165,0,0.9)", marginBottom:6 }}>
                    ⚠ Auto-send unavailable
                  </p>
                  <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.8rem", color:"rgba(255,255,255,0.45)", lineHeight:1.6, marginBottom:10 }}>
                    Your quote details are ready. Copy them below and email directly to{" "}
                    <a href="mailto:info@elevateworkwear.com" style={{ color:"#38bdf8" }}>info@elevateworkwear.com</a>
                  </p>
                  <button
                    onClick={() => {
                      const txt = [
                        `QUOTE REQUEST — ${ref}`,
                        `Company: ${company}`, `Contact: ${contact}`,
                        `Email: ${email}`, `Phone: ${phone}`,
                        `Postcode: ${postcode}`,
                        ``, `Product: ${config.productName}`,
                        `Size: ${config.size}`, `Qty: ${config.qty} units`,
                        `Method: ${config.method}`, `Positions: ${config.positions?.join(", ")}`,
                        ``, `Pricing: on quote`,
                      ].join("\n");
                      navigator.clipboard.writeText(txt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 3000); });
                    }}
                    style={{
                      fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.14em",
                      textTransform:"uppercase", cursor:"pointer", padding:"8px 16px",
                      border:"1px solid rgba(255,165,0,0.4)", color: copied ? "#4ade80" : "rgba(255,165,0,0.9)",
                      background:"transparent", transition:"color 0.2s, border-color 0.2s",
                    }}
                  >
                    {copied ? "✓ Copied to clipboard" : "Copy Quote Details"}
                  </button>
                </motion.div>
              )}
              </div>

              {/* Reference number */}
              <div style={{ padding:"16px 28px", border:"1px solid rgba(0,65,249,0.3)", background:"rgba(0,65,249,0.06)", width:"100%", maxWidth:360 }}>
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(0,65,249,0.7)", marginBottom:6 }}>
                  Your Reference Number
                </p>
                <p style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"2rem", letterSpacing:"0.1em", color:"#F5F5F3" }}>
                  {ref}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <button onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 py-3 cursor-pointer"
                  style={{ border:"1px solid rgba(0,65,249,0.5)", color:"rgba(255,255,255,0.7)", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.16em", textTransform:"uppercase", transition:"all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="#0041F9"; (e.currentTarget as HTMLElement).style.color="#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="rgba(0,65,249,0.5)"; (e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.7)"; }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 8v1.5A.5.5 0 002.5 10h7a.5.5 0 00.5-.5V8M6 1v6M3.5 5L6 7.5 8.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Download Quote PDF
                </button>
                <button onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 py-3 cursor-pointer"
                  style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.16em", textTransform:"uppercase", border:"1px solid rgba(255,255,255,0.08)", transition:"all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color="#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.5)"; }}>
                  Return to Products
                </button>
              </div>
            </motion.div>
          ) : (

        /* ══════════════════════════════════════
            FORM + SUMMARY
        ══════════════════════════════════════ */
            <motion.div key="form"
              initial={{ opacity:1 }} exit={{ opacity:0 }}
              className="grid grid-cols-1 md:grid-cols-[1fr_320px]"
            >
              {/* ── LEFT: Customer form ── */}
              <div className="px-6 py-6 flex flex-col gap-5"
                style={{ borderRight:"1px solid rgba(255,255,255,0.06)" }}>

                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>
                  Your Details
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div>
                    <FieldLabel required>Company Name</FieldLabel>
                    <Input value={company} onChange={setCompany} placeholder="Elevate Ltd"/>
                    {errors.company && <p style={{ color:"#f87171", fontSize:"0.55rem", marginTop:4 }}>{errors.company}</p>}
                  </div>

                  {/* Contact Name */}
                  <div>
                    <FieldLabel required>Contact Name</FieldLabel>
                    <Input value={contact} onChange={setContact} placeholder="John Smith"/>
                    {errors.contact && <p style={{ color:"#f87171", fontSize:"0.55rem", marginTop:4 }}>{errors.contact}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <FieldLabel required>Email Address</FieldLabel>
                    <Input value={email} onChange={setEmail} placeholder="john@company.com" type="email"/>
                    {errors.email && <p style={{ color:"#f87171", fontSize:"0.55rem", marginTop:4 }}>{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <FieldLabel required>Phone Number</FieldLabel>
                    <Input value={phone} onChange={setPhone} placeholder="+44 7700 900000" type="tel"/>
                    {errors.phone && <p style={{ color:"#f87171", fontSize:"0.55rem", marginTop:4 }}>{errors.phone}</p>}
                  </div>

                  {/* Job Title */}
                  <div>
                    <FieldLabel>Job Title</FieldLabel>
                    <Input value={title} onChange={setTitle} placeholder="Operations Manager"/>
                  </div>

                  {/* Website */}
                  <div>
                    <FieldLabel>Company Website</FieldLabel>
                    <Input value={website} onChange={setWebsite} placeholder="www.company.com"/>
                  </div>

                  {/* Postcode */}
                  <div>
                    <FieldLabel required>Delivery Postcode</FieldLabel>
                    <Input value={postcode} onChange={setPostcode} placeholder="EC1A 1BB"/>
                    {errors.postcode && <p style={{ color:"#f87171", fontSize:"0.55rem", marginTop:4 }}>{errors.postcode}</p>}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <FieldLabel>Additional Notes</FieldLabel>
                  <Textarea value={addNotes} onChange={setAddNotes}
                    placeholder="Any additional requirements, delivery instructions, or questions for the team..." rows={3}/>
                </div>

                {/* GDPR note */}
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)", lineHeight:1.6 }}>
                  By submitting this form you agree to being contacted by Elevate Workwear Solutions
                  regarding your quote request. Your data is not shared with third parties.
                </p>
              </div>

              {/* ── RIGHT: Quote summary ── */}
              <div className="px-5 py-6 flex flex-col gap-4"
                style={{ background:"rgba(255,255,255,0.015)" }}>

                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>
                  Quote Summary
                </p>

                <div className="flex flex-col">
                  <SummaryRow label="Product"    value={config.productName}/>
                  <SummaryRow label="Size"       value={config.size ?? "—"}/>
                  <SummaryRow label="Quantity"   value={`${config.qty} units`}/>
                  <SummaryRow label="Branding"   value={method}/>
                  <SummaryRow label="Position(s)" value={config.positions.join(", ") || "None"}/>
                  {config.fileName && <SummaryRow label="Logo File" value={config.fileName}/>}
                </div>

                {/* Price breakdown */}
                <div style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.06)", padding:"14px 16px" }}>
                  <div className="flex justify-between mb-2">
                    <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)" }}>
                      Base / unit
                    </span>
                    <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.82rem", color:"rgba(255,255,255,0.55)" }}>
                      On Quote
                    </span>
                  </div>
                  {config.brandingCost > 0 && (
                    <div className="flex justify-between mb-2">
                      <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)" }}>
                        Branding / unit
                      </span>
                      <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.82rem", color:"rgba(255,255,255,0.55)" }}>
                        +£{config.brandingCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2" style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                    <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)" }}>
                      Total / unit
                    </span>
                    <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.9rem", color:"#F5F5F3", fontWeight:500 }}>
                      On Quote
                    </span>
                  </div>
                </div>

                {/* Order total */}
                <div style={{ background:"rgba(0,65,249,0.08)", border:"1px solid rgba(0,65,249,0.25)", padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(0,65,249,0.7)", marginBottom:2 }}>
                      Estimated Order Total
                    </p>
                    <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)" }}>
                      {config.qty} units · {method !== "—" ? method : "no branding"}
                    </p>
                  </div>
                  <span style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.9rem", letterSpacing:"0.04em", color:"#F5F5F3", lineHeight:1 }}>
                    On Quote
                  </span>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2.5 py-4 cursor-pointer mt-auto"
                  style={{
                    background: submitting ? "rgba(0,65,249,0.5)" : "#0041F9",
                    color: "#fff",
                    fontFamily: "var(--font-jetbrains,monospace)",
                    fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase",
                    transition: "background 0.25s",
                    opacity: submitting ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLElement).style.background="#0035CC"; }}
                  onMouseLeave={e => { if (!submitting) (e.currentTarget as HTMLElement).style.background="#0041F9"; }}
                >
                  {submitting ? "Sending…" : "Submit Quote Request"}
                  {!submitting && (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 6.5H11M6.5 2L11 6.5L6.5 11" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>

                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)", textAlign:"center" }}>
                  No payment · Est. response within 5 hours
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
