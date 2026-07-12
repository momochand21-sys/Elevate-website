"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuoteModal } from "@/lib/quote-modal-context";

const SOMETHING_ELSE = "Something else";

const SERVICES = [
  "Hoodies",
  "Polo Shirts",
  "Gilets",
  "1/4 Zips",
  "Caps & Beanies",
  "Bundle Deal",
  "Multiple Products",
  SOMETHING_ELSE,
  "Not sure yet",
];

const inp: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.85)",
  fontFamily: "var(--font-dm-sans,sans-serif)",
  fontSize: "0.88rem",
  outline: "none",
  transition: "border-color 0.2s",
};

const MONO: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains,monospace)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export default function QuoteRequestModal() {
  const { isOpen, close } = useQuoteModal();

  const [name,     setName    ] = useState("");
  const [business, setBusiness] = useState("");
  const [email,    setEmail   ] = useState("");
  const [phone,    setPhone   ] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [customRequest, setCustomRequest] = useState("");
  const [qty,      setQty     ] = useState("");
  const [message,  setMessage ] = useState("");
  const [loading,  setLoading ] = useState(false);
  const [sent,     setSent    ] = useState(false);
  const [error,    setError   ] = useState("");

  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  const reset = () => {
    setName(""); setBusiness(""); setEmail(""); setPhone("");
    setServices([]); setCustomRequest(""); setQty(""); setMessage("");
    setSent(false); setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: services.length > 0
            ? services.map(s => s === SOMETHING_ELSE && customRequest.trim() ? `Something else: ${customRequest.trim()}` : s).join(", ")
            : "General Enquiry",
          size: qty ? `Approx. ${qty} units` : "Not specified",
          qty: parseInt(qty) || 0,
          method: "Enquiry",
          positions: [],
          fileName: null,
          notes: `Business: ${business || "—"}\nPhone: ${phone || "—"}${customRequest.trim() ? `\nCustom request: ${customRequest.trim()}` : ""}\nMessage: ${message || "—"}`,
          totalPerUnit: 0,
          totalOrder: 0,
          customerName: name,
          customerEmail: email,
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-[800]"
            style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-[801] flex flex-col"
            style={{
              top: "5vh",
              bottom: "5vh",
              width: "100%",
              maxWidth: 560,
              background: "#0A0A0E",
              border: "1px solid rgba(255,255,255,0.1)",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
              <div>
                <p style={{ ...MONO, fontSize: "0.5rem", color: "rgba(0,65,249,0.8)", marginBottom: 6 }}>
                  Elevate Workwear Solutions
                </p>
                <h2 style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "1.8rem", letterSpacing: "0.04em", color: "#F5F5F3", lineHeight: 1 }}>
                  Request a Free Quote
                </h2>
                <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.82rem", color: "rgba(255,255,255,0.38)", marginTop: 6, lineHeight: 1.5 }}>
                  Tell us what you need and we&apos;ll get back to you within 2 hours.
                </p>
              </div>
              <button onClick={close}
                style={{ cursor: "pointer", color: "rgba(255,255,255,0.35)", background: "none", border: "none", fontSize: "1.3rem", marginTop: 2, lineHeight: 1 }}>
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-6">
              {sent ? (
                /* Success state */
                <div className="flex flex-col items-center text-center gap-5 py-8">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#0041F9" }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path d="M4 11L9 16L18 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "1.6rem", letterSpacing: "0.04em", color: "#F5F5F3", marginBottom: 8 }}>
                      Quote Request Sent
                    </h3>
                    <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: "26rem" }}>
                      Thanks {name.split(" ")[0]}! We&apos;ve received your request and will be in touch within 2 hours with a tailored quote.
                    </p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => { reset(); close(); }}
                      style={{ padding: "12px 24px", background: "#0041F9", border: "none", cursor: "pointer", ...MONO, fontSize: "0.55rem", color: "#fff" }}>
                      Close
                    </button>
                    <button onClick={reset}
                      style={{ padding: "12px 24px", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", cursor: "pointer", ...MONO, fontSize: "0.55rem", color: "rgba(255,255,255,0.45)" }}>
                      Submit Another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {/* Name + Business */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p style={{ ...MONO, fontSize: "0.46rem", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Your Name *</p>
                      <input value={name} onChange={e => setName(e.target.value)} required
                        placeholder="John Smith" style={inp}
                        onFocus={e => { e.target.style.borderColor = "rgba(0,65,249,0.6)"; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />
                    </div>
                    <div>
                      <p style={{ ...MONO, fontSize: "0.46rem", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Business Name</p>
                      <input value={business} onChange={e => setBusiness(e.target.value)}
                        placeholder="Acme Ltd" style={inp}
                        onFocus={e => { e.target.style.borderColor = "rgba(0,65,249,0.6)"; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />
                    </div>
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p style={{ ...MONO, fontSize: "0.46rem", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Email Address *</p>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        placeholder="john@company.com" style={inp}
                        onFocus={e => { e.target.style.borderColor = "rgba(0,65,249,0.6)"; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />
                    </div>
                    <div>
                      <p style={{ ...MONO, fontSize: "0.46rem", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Phone Number</p>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="07700 000000" style={inp}
                        onFocus={e => { e.target.style.borderColor = "rgba(0,65,249,0.6)"; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />
                    </div>
                  </div>

                  {/* Product interest */}
                  <div>
                    <p style={{ ...MONO, fontSize: "0.46rem", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>What are you interested in?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SERVICES.map(s => {
                        const active = services.includes(s);
                        return (
                          <button key={s} type="button"
                            onClick={() => setServices(prev => active ? prev.filter(x => x !== s) : [...prev, s])}
                            style={{ padding: "9px 12px", border: `1px solid ${active ? "#0041F9" : "rgba(255,255,255,0.1)"}`, background: active ? "rgba(0,65,249,0.1)" : "transparent", cursor: "pointer", textAlign: "left", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 14, height: 14, border: `1px solid ${active ? "#0041F9" : "rgba(255,255,255,0.2)"}`, background: active ? "#0041F9" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                              {active && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4L3.2 6.5L7 1.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </span>
                            <span style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.82rem", color: active ? "#fff" : "rgba(255,255,255,0.5)" }}>
                              {s}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Something else — describe exactly what you need */}
                  <AnimatePresence initial={false}>
                    {services.includes(SOMETHING_ELSE) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ paddingTop: 2 }}>
                          <p style={{ ...MONO, fontSize: "0.46rem", color: "rgba(0,65,249,0.85)", marginBottom: 6 }}>
                            Tell us exactly what you need
                          </p>
                          <textarea value={customRequest} onChange={e => setCustomRequest(e.target.value)} rows={3}
                            placeholder="e.g. 40 hi-vis vests, 10 branded aprons, softshell jackets — describe the garments, colours and any branding you'd like…"
                            style={{ ...inp, resize: "vertical", borderColor: "rgba(0,65,249,0.45)" }}
                            onFocus={e => { e.target.style.borderColor = "rgba(0,65,249,0.7)"; }}
                            onBlur={e => { e.target.style.borderColor = "rgba(0,65,249,0.45)"; }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Approx quantity */}
                  <div>
                    <p style={{ ...MONO, fontSize: "0.46rem", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Approximate Quantity</p>
                    <input value={qty} onChange={e => setQty(e.target.value)}
                      placeholder="e.g. 25 hoodies" style={inp}
                      onFocus={e => { e.target.style.borderColor = "rgba(0,65,249,0.6)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />
                  </div>

                  {/* Message */}
                  <div>
                    <p style={{ ...MONO, fontSize: "0.46rem", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Additional Details (optional)</p>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                      placeholder="Logo colours, branding positions, specific requirements, deadline…"
                      style={{ ...inp, resize: "vertical" }}
                      onFocus={e => { e.target.style.borderColor = "rgba(0,65,249,0.6)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />
                  </div>

                  {error && (
                    <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem", color: "#f87171" }}>{error}</p>
                  )}

                  <button type="submit" disabled={loading || !name || !email}
                    style={{ padding: "14px", background: loading || !name || !email ? "rgba(0,65,249,0.35)" : "#0041F9", border: "none", cursor: loading || !name || !email ? "not-allowed" : "pointer", transition: "background 0.2s", marginTop: 4 }}>
                    <span style={{ ...MONO, fontSize: "0.6rem", color: "#fff" }}>
                      {loading ? "Sending…" : "Send Quote Request →"}
                    </span>
                  </button>

                  <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.75rem", color: "rgba(255,255,255,0.22)", textAlign: "center", lineHeight: 1.5 }}>
                    No obligation. We respond within 2 hours on business days.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
