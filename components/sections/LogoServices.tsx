"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const SERVICES = [
  {
    id: "new-logo",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="3" width="22" height="22" rx="1" stroke="#0041F9" strokeWidth="1.5"/>
        <path d="M9 19L13 10L17 16L19.5 12L22 19" stroke="#0041F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9.5" cy="9.5" r="1.5" fill="#0041F9"/>
      </svg>
    ),
    title: "New Logo Design",
    description: "No logo yet? No problem. Our designers will create a professional brand mark tailored to your industry and style — ready to embroider, print, or use anywhere.",
    detail: "Includes up to 3 initial concepts, 2 rounds of revisions, and final files in all formats (SVG, PNG, PDF, AI).",
    price: "£20",
  },
  {
    id: "digitise",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M5 14h18M14 5v18" stroke="#0041F9" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 8l4 4-4 4M20 8l-4 4 4 4" stroke="#0041F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Logo Digitisation",
    description: "Already have a logo but need it ready for embroidery? We convert your artwork into a professional embroidery file (DST/EMB) — optimised for clean, sharp stitching.",
    detail: "Works from any source file — JPG, PNG, PDF, AI, EPS. Turnaround typically 24–48 hours.",
    price: "£10",
  },
];

type ServiceId = "new-logo" | "digitise";

const reveal = {
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
};

export default function LogoServices() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  const [selected, setSelected]   = useState<ServiceId | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [name,     setName]       = useState("");
  const [business, setBusiness]   = useState("");
  const [email,    setEmail]      = useState("");
  const [phone,    setPhone]      = useState("");
  const [details,  setDetails]    = useState("");
  const [loading,  setLoading]    = useState(false);
  const [sent,     setSent]       = useState(false);
  const [error,    setError]      = useState("");

  const handleSubmit = async () => {
    if (!name || !email || !selected) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/logo-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, business, email, phone, service: selected, details }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelected(null); setShowForm(false); setName(""); setBusiness("");
    setEmail(""); setPhone(""); setDetails(""); setSent(false); setError("");
  };

  const inputStyle = {
    width: "100%" as const,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "11px 14px",
    fontFamily: "var(--font-dm-sans,sans-serif)",
    fontSize: "0.875rem",
    color: "#F5F5F3",
    outline: "none",
  };

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden py-24 md:py-32"
      style={{ background: "#070708" }}
    >
      {/* separators */}
      <div className="absolute top-0 inset-x-0 h-[1px]" style={{ background: "rgba(255,255,255,0.05)" }}/>
      <div className="absolute bottom-0 inset-x-0 h-[1px]" style={{ background: "rgba(255,255,255,0.05)" }}/>
      {/* glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 55% at 50% 50%, rgba(0,65,249,0.05) 0%, transparent 70%)" }}/>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <p className="section-label mb-4" style={{ color: "rgba(0,65,249,0.8)" }}>More Than Workwear</p>
          <h2 className="text-off-white mb-5" style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "clamp(2.4rem,5vw,4rem)", letterSpacing: "0.04em", lineHeight: 0.95 }}>
            We Also Build<br/>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>Your Brand Identity</span>
          </h2>
          <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "clamp(0.875rem,1.4vw,1rem)", color: "rgba(255,255,255,0.42)", lineHeight: 1.75, maxWidth: "38rem" }}>
            Don&apos;t have a logo yet — or need yours converted for embroidery? We offer professional logo design and digitisation so your brand looks sharp on every garment we produce.
          </p>
        </motion.div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 md:max-w-4xl md:mx-auto w-full">
          {SERVICES.map((s, i) => {
            const active = selected === s.id;
            return (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => {
                  if (selected === s.id) {
                    setSelected(null); setShowForm(false);
                  } else {
                    setSelected(s.id as ServiceId); setShowForm(true); setSent(false);
                  }
                }}
                className="text-left flex flex-col gap-4 transition-all duration-200"
                style={{
                  padding: "24px",
                  border: `1px solid ${active ? "#0041F9" : "rgba(255,255,255,0.07)"}`,
                  background: active ? "rgba(0,65,249,0.07)" : "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-start justify-between">
                  {s.icon}
                  {active && (
                    <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.44rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#0041F9", border: "1px solid rgba(0,65,249,0.4)", padding: "3px 7px" }}>Selected</span>
                  )}
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "1.35rem", letterSpacing: "0.04em", color: "#F5F5F3", lineHeight: 1, marginBottom: 8 }}>
                    {s.title}
                  </h3>
                  <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.83rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>
                    {s.description}
                  </p>
                </div>
                <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                  {s.detail}
                </p>
                <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "1.25rem", letterSpacing: "0.04em", color: active ? "#F5F5F3" : "rgba(255,255,255,0.5)", lineHeight: 1 }}>{s.price}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.48rem", letterSpacing: "0.1em", textTransform: "uppercase", color: active ? "#0041F9" : "rgba(255,255,255,0.3)" }}>
                    {active ? "↓ Fill in below" : "Get a quote →"}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Enquiry form — appears when a service is selected */}
        <AnimatePresence>
          {showForm && (
            <motion.div key="form" {...reveal}>
              <div style={{ border: "1px solid rgba(0,65,249,0.25)", background: "rgba(0,65,249,0.04)", padding: "32px" }}>
                {sent ? (
                  /* Success state */
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#0041F9" }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 10L8 14L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "1.8rem", letterSpacing: "0.04em", color: "#F5F5F3" }}>Enquiry Sent</h3>
                    <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.9rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: "28rem" }}>
                      We&apos;ll review your request and come back to you within 1 business day with a quote and next steps.
                    </p>
                    <button onClick={resetForm}
                      style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", cursor: "pointer", marginTop: 8 }}>
                      ← Start another enquiry
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(0,65,249,0.8)", marginBottom: 20 }}>
                      {SERVICES.find(s => s.id === selected)?.title} — Enquiry
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 6 }}>Your Name *</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" style={inputStyle}/>
                      </div>
                      <div>
                        <label style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 6 }}>Business Name</label>
                        <input value={business} onChange={e => setBusiness(e.target.value)} placeholder="Acme Ltd" style={inputStyle}/>
                      </div>
                      <div>
                        <label style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 6 }}>Email Address *</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@acme.co.uk" style={inputStyle}/>
                      </div>
                      <div>
                        <label style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 6 }}>Phone Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07700 000000" style={inputStyle}/>
                      </div>
                    </div>

                    <div className="mb-5">
                      <label style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 6 }}>Tell us more (optional)</label>
                      <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3}
                        placeholder="Describe your business, the style you're after, any colours, industry, existing brand assets…"
                        style={{ ...inputStyle, resize: "vertical" }}/>
                    </div>

                    {error && (
                      <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem", color: "#f87171", marginBottom: 12 }}>{error}</p>
                    )}

                    <div className="flex items-center gap-4 flex-wrap">
                      <button
                        onClick={handleSubmit}
                        disabled={loading || !name || !email}
                        style={{
                          padding: "14px 28px",
                          background: (!loading && name && email) ? "#0041F9" : "rgba(0,65,249,0.25)",
                          border: "none", cursor: (!loading && name && email) ? "pointer" : "not-allowed",
                          fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.58rem",
                          letterSpacing: "0.16em", textTransform: "uppercase", color: "#fff",
                          transition: "background 0.2s",
                        }}
                      >
                        {loading ? "Sending…" : "Send Enquiry →"}
                      </button>
                      <button onClick={() => setShowForm(false)}
                        style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
