"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBasket } from "@/lib/basket-context";
import type { BasketItem } from "@/lib/basket-context";
import { basketQualifiesForCheckout, checkoutStatusMessage } from "@/lib/basket-rules";
import BasketItemEditor from "@/components/ui/BasketItemEditor";

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
const MONO: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains,monospace)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};
const BEBAS: React.CSSProperties = {
  fontFamily: "var(--font-bebas,'Bebas Neue')",
  letterSpacing: "0.04em",
};
const basketInputStyle: React.CSSProperties = {
  background: "transparent", border: "none",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  padding: "10px 0",
  fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.85rem",
  color: "rgba(255,255,255,0.75)", outline: "none", transition: "border-color 0.2s",
  width: "100%",
};

function sizeBreakdown(item: BasketItem): string {
  if (item.sizeQtys) {
    return Object.entries(item.sizeQtys)
      .filter(([, q]) => q > 0)
      .map(([s, q]) => `${q}×${s}`)
      .join("  ");
  }
  if (item.qty) return `${item.qty} units (One Size)`;
  return "";
}

function brandingLabel(item: BasketItem): string {
  if (item.logo === "no") return "No branding";
  if (item.method === "embroidery") return "Embroidery";
  if (item.method === "print") return "Print";
  if (item.method === "both") return "Embroidery + Print";
  return "Branded";
}

/* ─────────────────────────────────────────────────────────────────
   BASKET ITEM CARD
───────────────────────────────────────────────────────────────── */
function BasketCard({ item, onRemove, onEdit }: { item: BasketItem; onRemove: () => void; onEdit: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
        padding: "24px",
      }}
      className="flex flex-col gap-4"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p style={{ ...MONO, fontSize: "0.48rem", color: "rgba(0,65,249,0.75)", marginBottom: 6 }}>
            {item.productCode} &nbsp;·&nbsp; {brandingLabel(item)}
          </p>
          <p style={{ ...BEBAS, fontSize: "1.35rem", color: "#F5F5F3", lineHeight: 1 }}>
            {item.productName}
          </p>
          <Link
            href={item.productHref}
            style={{ ...MONO, fontSize: "0.44rem", color: "rgba(255,255,255,0.28)", textDecoration: "none", marginTop: 4, display: "block" }}
          >
            View product →
          </Link>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={onEdit}
            style={{ ...MONO, fontSize:"0.48rem", color:"rgba(0,65,249,0.8)", cursor:"pointer", padding:"6px 10px",
              border:"1px solid rgba(0,65,249,0.3)", background:"rgba(0,65,249,0.06)", transition:"all 0.15s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(0,65,249,0.15)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(0,65,249,0.06)";}}>
            Edit
          </button>
          <button onClick={onRemove}
            style={{ ...MONO, fontSize:"0.48rem", color:"rgba(255,255,255,0.28)", cursor:"pointer", padding:"6px 10px",
              border:"1px solid rgba(255,255,255,0.08)", transition:"all 0.15s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.3)";(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.6)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.08)";(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.28)";}}>
            Remove
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

      {/* Bundle contents */}
      {item.isBundle && item.bundleContents && (
        <div className="flex flex-col gap-2" style={{ padding: "12px 14px", border: "1px solid rgba(0,65,249,0.15)", background: "rgba(0,65,249,0.04)" }}>
          <p style={{ ...MONO, fontSize: "0.44rem", color: "rgba(0,65,249,0.7)", marginBottom: 2 }}>Bundle Contents</p>
          {item.bundleContents.map((c, i) => {
            const sizes = c.sizeQtys
              ? Object.entries(c.sizeQtys).filter(([, q]) => q > 0).map(([s, q]) => `${q}×${s}`).join("  ")
              : "";
            return (
              <div key={i} className="flex items-center justify-between">
                <span style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>
                  {c.qty}× {c.name}
                </span>
                <span style={{ ...MONO, fontSize: "0.46rem", color: "rgba(255,255,255,0.4)" }}>{sizes || "—"}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Size breakdown chips (non-bundle) */}
      {!item.isBundle && item.sizeQtys && Object.keys(item.sizeQtys).length > 0 && (
        <div>
          <p style={{ ...MONO, fontSize: "0.44rem", color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>Sizes</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(item.sizeQtys).filter(([,q])=>q>0).map(([s,q]) => (
              <div key={s} style={{ border:"1px solid rgba(255,255,255,0.1)", padding:"6px 12px", minWidth:60, textAlign:"center" }}>
                <p style={{ ...MONO, fontSize:"0.52rem", color:"rgba(255,255,255,0.4)", marginBottom:2 }}>{s}</p>
                <p style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.1rem", color:"#F5F5F3", lineHeight:1 }}>{q}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {[
          { k: "Total Units",    v: `${item.totalQty} units` },
          { k: "Branding",       v: brandingLabel(item) },
          ...(item.positions && item.positions.length > 0
            ? [{ k: "Position(s)", v: item.positions.join(", ") }]
            : []),
          ...(item.logo === "yes" && item.logoFileName
            ? [{ k: "Logo File", v: item.logoFileName }]
            : []),
          ...(item.notes
            ? [{ k: "Notes", v: item.notes }]
            : []),
        ].map(({ k, v }) => (
          <div key={k} style={{ gridColumn: k === "Notes" ? "1 / -1" : undefined }}>
            <p style={{ ...MONO, fontSize: "0.44rem", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>{k}</p>
            <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

      {/* Pricing row */}
      <div className="flex items-center justify-between">
        <div>
          <p style={{ ...MONO, fontSize: "0.44rem", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>Price per unit</p>
          <p style={{ ...BEBAS, fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1 }}>
            On Quote
          </p>
          {item.brandingCost > 0 && (
            <p style={{ ...MONO, fontSize: "0.44rem", color: "rgba(0,65,249,0.65)", marginTop: 3 }}>
              +£{item.brandingCost.toFixed(2)} branding per unit
            </p>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ ...MONO, fontSize: "0.44rem", color: "rgba(0,65,249,0.7)", marginBottom: 4 }}>Line total</p>
          <p style={{ ...BEBAS, fontSize: "1.9rem", color: "#F5F5F3", lineHeight: 1 }}>
            On Quote
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ORDER SUMMARY PANEL
───────────────────────────────────────────────────────────────── */
function OrderSummary({
  items,
  totalQty,
  totalValue,
  totalDigitising,
}: {
  items: BasketItem[];
  totalQty: number;
  totalValue: number;
  totalDigitising: number;
}) {
  const router = useRouter();
  const [orderNotes, setOrderNotes] = useState("");
  const [contact, setContact] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const qualifiesForCheckout = basketQualifiesForCheckout(items);
  const statusMsg = checkoutStatusMessage(items, totalQty);
  const detailsMissing = !contact.trim() || !email.trim();

  const handleRequestQuote = async () => {
    if (detailsMissing) {
      setQuoteError("Please add your name and email so we can get back to you.");
      return;
    }
    setLoading(true);
    setQuoteError("");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basket: items,
          orderNotes,
          company: company.trim() || "—",
          contact: contact.trim(),
          email: email.trim(),
          phone: phone.trim() || "—",
          postcode: "—",
          reference: `BSK-${Date.now().toString(36).toUpperCase()}`,
          /* Aggregate totals */
          totalOrder: totalValue,
        }),
      });
      if (res.ok) {
        setQuoteSent(true);
      } else {
        const d = await res.json();
        setQuoteError(d.error ?? "Failed to send quote request.");
      }
    } catch {
      setQuoteError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basket: items, orderNotes, totalOrder: totalValue }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setQuoteError(data.error ?? "Checkout failed.");
        setLoading(false);
      }
    } catch {
      setQuoteError("Network error — please try again.");
      setLoading(false);
    }
  };

  if (quoteSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          border: "1px solid rgba(0,65,249,0.3)",
          background: "rgba(0,65,249,0.05)",
          padding: "28px 24px",
        }}
        className="flex flex-col gap-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue flex-shrink-0 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 style={{ ...BEBAS, fontSize: "1.6rem", color: "#F5F5F3", lineHeight: 1 }}>
            Quote Sent
          </h3>
        </div>
        <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.88rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.7 }}>
          Please wait for an agent to get back to you.
        </p>
        <Link href="/products" style={{ ...MONO, fontSize: "0.5rem", color: "rgba(255,255,255,0.38)", textDecoration: "none" }}>
          ← Continue Shopping
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Subtotals per item */}
      <div style={{ border: "1px solid rgba(255,255,255,0.08)", padding: "20px 24px" }}>
        <p style={{ ...MONO, fontSize: "0.48rem", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>Order Summary</p>
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.id} className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.82rem", color: "rgba(255,255,255,0.55)" }}>
                  {item.productName}
                </p>
                <p style={{ ...MONO, fontSize: "0.44rem", color: "rgba(255,255,255,0.28)", marginTop: 2 }}>
                  {item.totalQty} units
                </p>
              </div>
              <p style={{ ...BEBAS, fontSize: "1.05rem", color: "rgba(255,255,255,0.65)", lineHeight: 1, flexShrink: 0 }}>
                On Quote
              </p>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />

        {/* Digitising line */}
        {totalDigitising > 0 && (
          <div className="flex flex-col gap-1 mb-3 pb-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between">
              <p style={{ ...MONO, fontSize: "0.48rem", color: "rgba(255,255,255,0.5)" }}>One-Time Logo Digitising</p>
              <p style={{ ...MONO, fontSize: "0.55rem", color: "rgba(255,255,255,0.75)" }}>£{totalDigitising.toFixed(2)}</p>
            </div>
            <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.75rem", color:"rgba(255,255,255,0.3)", lineHeight:1.5 }}>
              Future orders using the same logo are free.
            </p>
          </div>
        )}
        {totalDigitising === 0 && items.some(i => i.logo === "yes") && (
          <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ ...MONO, fontSize: "0.48rem", color: "rgba(74,222,128,0.7)" }}>Logo Digitising</p>
            <p style={{ ...MONO, fontSize: "0.55rem", color: "#4ade80" }}>FREE</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p style={{ ...MONO, fontSize: "0.44rem", color: "rgba(255,255,255,0.28)" }}>Total Units</p>
            <p style={{ ...MONO, fontSize: "0.62rem", color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{totalQty} units</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ ...MONO, fontSize: "0.44rem", color: "rgba(0,65,249,0.7)" }}>Total Price</p>
            <p style={{ ...BEBAS, fontSize: "2rem", color: "#F5F5F3", lineHeight: 1, marginTop: 2 }}>
              On Quote
            </p>
          </div>
        </div>
      </div>

      {/* Your details — required so we can quote you back directly */}
      <div>
        <p style={{ ...MONO, fontSize: "0.48rem", color: "rgba(255,255,255,0.28)", marginBottom: 10 }}>
          Your Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <input
            value={contact}
            onChange={e => setContact(e.target.value)}
            placeholder="Your name *"
            style={basketInputStyle}
            onFocus={e => { e.target.style.borderBottomColor = "rgba(0,65,249,0.55)"; }}
            onBlur={e => { e.target.style.borderBottomColor = "rgba(255,255,255,0.1)"; }}
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address *"
            type="email"
            style={basketInputStyle}
            onFocus={e => { e.target.style.borderBottomColor = "rgba(0,65,249,0.55)"; }}
            onBlur={e => { e.target.style.borderBottomColor = "rgba(255,255,255,0.1)"; }}
          />
          <input
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="Business name (optional)"
            style={basketInputStyle}
            onFocus={e => { e.target.style.borderBottomColor = "rgba(0,65,249,0.55)"; }}
            onBlur={e => { e.target.style.borderBottomColor = "rgba(255,255,255,0.1)"; }}
          />
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Phone number (optional)"
            type="tel"
            style={basketInputStyle}
            onFocus={e => { e.target.style.borderBottomColor = "rgba(0,65,249,0.55)"; }}
            onBlur={e => { e.target.style.borderBottomColor = "rgba(255,255,255,0.1)"; }}
          />
        </div>
      </div>

      {/* Order notes */}
      <div>
        <p style={{ ...MONO, fontSize: "0.48rem", color: "rgba(255,255,255,0.28)", marginBottom: 10 }}>
          Additional Order Notes (Optional)
        </p>
        <textarea
          value={orderNotes}
          onChange={e => setOrderNotes(e.target.value)}
          placeholder="Delivery requirements, rush orders, specific branding notes..."
          rows={3}
          className="w-full"
          style={{
            resize: "vertical", background: "transparent", border: "none",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            padding: "10px 0",
            fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.85rem",
            color: "rgba(255,255,255,0.5)", lineHeight: 1.6, outline: "none", transition: "border-color 0.2s",
          }}
          onFocus={e => { e.target.style.borderBottomColor = "rgba(0,65,249,0.55)"; }}
          onBlur={e => { e.target.style.borderBottomColor = "rgba(255,255,255,0.1)"; }}
        />
      </div>

      {/* Smart CTA */}
      <div className="flex flex-col gap-3">
        {quoteError && (
          <p style={{ ...MONO, fontSize: "0.48rem", color: "#f87171" }}>{quoteError}</p>
        )}

        <button
          onClick={qualifiesForCheckout ? handleCheckout : handleRequestQuote}
          disabled={loading || (!qualifiesForCheckout && detailsMissing)}
          className="w-full flex items-center justify-center gap-3 py-4 cursor-pointer"
          style={{
            background: qualifiesForCheckout ? (loading ? "rgba(0,65,249,0.5)" : "#0041F9") : "transparent",
            border: `1px solid ${qualifiesForCheckout ? "#0041F9" : "rgba(255,255,255,0.25)"}`,
            opacity: loading || (!qualifiesForCheckout && detailsMissing) ? 0.5 : 1,
            cursor: loading || (!qualifiesForCheckout && detailsMissing) ? "not-allowed" : "pointer",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => {
            if (loading) return;
            const el = e.currentTarget as HTMLElement;
            if (qualifiesForCheckout) el.style.background = "#0035CC";
            else el.style.borderColor = "rgba(255,255,255,0.55)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            if (qualifiesForCheckout) el.style.background = "#0041F9";
            else el.style.borderColor = "rgba(255,255,255,0.25)";
          }}
        >
          <span style={{ ...MONO, fontSize: "0.6rem", color: qualifiesForCheckout ? "#fff" : "rgba(255,255,255,0.8)" }}>
            {loading
              ? "Processing…"
              : qualifiesForCheckout
              ? "Proceed to Checkout →"
              : "Request Quote →"}
          </span>
        </button>

        <p style={{ ...MONO, fontSize: "0.44rem", color: "rgba(255,255,255,0.22)", textAlign: "center" }}>
          {statusMsg}
        </p>

        {/* Small print */}
        <p style={{ ...MONO, fontSize: "0.44rem", color: "rgba(255,255,255,0.18)", textAlign: "center", marginTop: 4 }}>
          Production turnaround: 8 days (excl. delivery)
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────── */
export default function BasketPage() {
  const { items, totalQty, totalValue, totalDigitising, removeItem, updateItem, clearBasket } = useBasket();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingItem = items.find(i => i.id === editingId) ?? null;

  return (
    <main className="min-h-screen" style={{ background: "#050505" }}>

      {/* ── Breadcrumb ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-28 pb-0">
        <nav className="flex items-center gap-2" aria-label="Breadcrumb">
          {[
            { label: "Products", href: "/products" },
            { label: "Basket",   href: "" },
          ].map((crumb, i, arr) => (
            <span key={crumb.label} className="flex items-center gap-2">
              {crumb.href ? (
                <Link href={crumb.href}
                  className="font-mono text-[8px] tracking-[0.18em] uppercase transition-colors duration-200 text-white/30 hover:text-white/65">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-mono text-[8px] tracking-[0.18em] uppercase"
                  style={{ color: "rgba(0,65,249,0.8)" }}>
                  {crumb.label}
                </span>
              )}
              {i < arr.length - 1 && (
                <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.6rem" }}>/</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10">
        {/* Page header */}
        <div className="flex items-baseline justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 style={{ ...BEBAS, fontSize: "clamp(2.4rem,5vw,4rem)", color: "#F5F5F3", lineHeight: 1 }}>
              Your Basket
            </h1>
            {items.length > 0 && (
              <p style={{ ...MONO, fontSize: "0.5rem", color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
                {items.length} product{items.length !== 1 ? "s" : ""} · {totalQty} unit{totalQty !== 1 ? "s" : ""} total
              </p>
            )}
          </div>
          {items.length > 0 && (
            <button
              onClick={clearBasket}
              style={{ ...MONO, fontSize: "0.48rem", color: "rgba(255,255,255,0.25)", cursor: "pointer", transition: "color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)"; }}
            >
              Clear basket
            </button>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-24 gap-6 text-center"
          >
            <div style={{
              width: 72, height: 72,
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
                  stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ ...BEBAS, fontSize: "1.8rem", color: "#F5F5F3", marginBottom: 8 }}>
                Your basket is empty
              </p>
              <p style={{ ...MONO, fontSize: "0.5rem", color: "rgba(255,255,255,0.3)" }}>
                Add products from the catalogue to get started
              </p>
            </div>
            <Link
              href="/products"
              style={{
                ...MONO, fontSize: "0.55rem", color: "#0041F9", textDecoration: "none",
                border: "1px solid rgba(0,65,249,0.4)", padding: "12px 24px",
                transition: "all 0.2s",
              }}
            >
              Browse Products →
            </Link>
          </motion.div>
        )}

        {/* Two-column layout when items exist */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[60%_38%] gap-8 lg:gap-12 items-start">

            {/* ── LEFT: Item list ── */}
            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {items.map(item => (
                  <BasketCard
                    key={item.id}
                    item={item}
                    onRemove={() => removeItem(item.id)}
                    onEdit={() => setEditingId(item.id)}
                  />
                ))}
              </AnimatePresence>

              {/* Continue shopping */}
              <Link
                href="/products"
                style={{ ...MONO, fontSize: "0.5rem", color: "rgba(255,255,255,0.3)", textDecoration: "none", marginTop: 8, display: "inline-block" }}
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* ── RIGHT: Order summary (sticky) ── */}
            <div className="lg:sticky" style={{ top: 100 }}>
              <OrderSummary
                items={items}
                totalQty={totalQty}
                totalValue={totalValue}
                totalDigitising={totalDigitising}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Item Editor Overlay ── */}
      <AnimatePresence>
        {editingItem && (
          <BasketItemEditor
            key={editingItem.id}
            item={editingItem}
            onSave={patch => updateItem(editingItem.id, patch)}
            onClose={() => setEditingId(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
