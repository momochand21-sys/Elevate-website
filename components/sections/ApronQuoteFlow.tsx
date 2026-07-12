"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import LogoUploadStep, { type LogoUploadResult } from "@/components/ui/LogoUploadStep";
import { useBasket } from "@/lib/basket-context";
import { getPositionPrice, PRODUCT_TIERS } from "@/lib/product-pricing";

/* ─── Constants ─── */
// Apron: one size, one position (Front Centre), same price for either method
const POSITIONS = ["Front Centre"] as const;

type Size     = "One Size";
type Position = typeof POSITIONS[number];
type Logo     = "yes" | "no" | null;
type Method   = "embroidery" | "print" | null;   // "both" removed — single position

/* ─── Branding prices — Front Centre only, £3.50 for both methods ─── */
const PRICE: Record<"embroidery" | "print", Record<Position, number>> = {
  embroidery: { "Front Centre": 3.50 },
  print:      { "Front Centre": 1.67 },
};

const METHODS = [
  {
    id:    "embroidery" as const,
    label: "Embroidery",
    desc:  "Stitched directly into fabric. Durable, raised finish. Industry standard.",
    prices: [{ pos: "Front Centre", price: "£3.50" }],
  },
  {
    id:    "print" as const,
    label: "Print",
    desc:  "High-definition DTG or screen print. Ideal for complex designs.",
    prices: [{ pos: "Front Centre", price: "£1.67" }],
  },
];

/* ─── Volume pricing tiers — central source of truth ─── */
const QTY_TIERS = PRODUCT_TIERS["ELV-009"];

function unitPrice(q: number | ""): number {
  const n = Number(q) || 0;
  return QTY_TIERS.find(t => n >= t.min && n <= t.max)?.price ?? QTY_TIERS[0].price;
}

/* ─── Shared animation ─── */
const reveal = {
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const },
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "var(--font-jetbrains,monospace)",
      fontSize:   "0.52rem",
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "rgba(0,65,249,0.7)",
      marginBottom: "10px",
    }}>
      {children}
    </p>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "4px 0" }} />;
}

/* ─────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────── */
export default function ApronQuoteFlow({ productName }: { productName: string }) {
  const basket = useBasket();

  const size = "One Size" as const;   // beanie is one size — fixed
  const [qty,       setQty      ] = useState<number | "">(10);
  const [logoResult, setLogoResult] = useState<LogoUploadResult | null>(null);
  const logo       = logoResult ? (logoResult.hasLogo ? "yes" : "no") : null;
  const fileName   = logoResult?.fileName ?? null;
  const digitising = logoResult?.digitising ?? null;
  const [method,    setMethod   ] = useState<Method>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [notes,     setNotes    ] = useState("");
  const [addedToBasket, setAddedToBasket] = useState(false);

  const QTY_PRESETS = [10, 25, 50, 100, 250];
  const MIN_QTY = 1;

  const togglePos = (pos: Position) =>
    setPositions(prev =>
      prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
    );

  /* Live pricing */
  const basePerUnit  = unitPrice(qty);
  const priceKey     = method;  // no "both" for beanie
  const brandingCost = priceKey
    ? positions.reduce((sum, pos) => sum + getPositionPrice(pos, priceKey, Number(qty) || 1), 0)
    : 0;
  const totalPerUnit  = basePerUnit + brandingCost;
  const totalOrder    = totalPerUnit * (Number(qty) || 0);
  const isBoth        = false;  // single position only

  const canSubmit =
    logoResult !== null &&
    (logo === "no" || (method !== null && positions.length > 0));

  const reset = () => {
    setQty(10); setLogoResult(null); setMethod(null);
    setPositions([]); setNotes("");     setAddedToBasket(false);
  };

  const handleAddToBasket = () => {
    const numQty = Number(qty) || 0;
    basket.addItem({
      productName,
      productCode: "ELV-009",
      productHref: "/products/hospitality/apron",
      qty: numQty,
      totalQty: numQty,
      logo: logo!,
      logoFileName: fileName ?? undefined,
      digitisingFee: digitising?.fee,
      digitisingLabel: digitising?.label,
      method,
      positions: [...positions],
      notes: notes || undefined,
      basePerUnit,
      brandingCost,
      totalPerUnit,
      totalOrder,
    });
    setAddedToBasket(true);
  };

  /* ── Added to basket state ── */
  if (addedToBasket) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ border:"1px solid rgba(0,65,249,0.3)", background:"rgba(0,65,249,0.05)", padding:"28px 24px" }}
        className="flex flex-col gap-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-blue flex-shrink-0 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.5rem", letterSpacing:"0.05em", color:"#F5F5F3", lineHeight:1 }}>Added to Basket</h3>
        </div>
        <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.85rem", color:"rgba(255,255,255,0.42)", lineHeight:1.7 }}>
          {productName} has been added to your basket. Configure more or head to checkout.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/basket" style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.16em", textTransform:"uppercase", color:"#0041F9", textDecoration:"none" }}>
            View Basket →
          </Link>
          <button onClick={reset} style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)", cursor:"pointer", textAlign:"left" }}>
            ← Add another configuration
          </button>
        </div>
      </motion.div>
    );
  }

  /* ── Main flow ── */
  return (
    <div className="flex flex-col gap-7">

      {/* ══ 1. QUANTITY (no size step — beanie is one size) ══ */}
      <div>
        <div style={{ marginTop: 0 }}>
              <Label>Quantity</Label>
              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {QTY_PRESETS.map(n => (
                  <button key={n}
                    onClick={() => setQty(n)}
                    className="px-4 py-2 transition-all duration-200 cursor-pointer"
                    style={{
                      fontFamily: "var(--font-jetbrains,monospace)",
                      fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase",
                      color: qty === n ? "#fff" : "rgba(255,255,255,0.38)",
                      border: `1px solid ${qty === n ? "#0041F9" : "rgba(255,255,255,0.07)"}`,
                      background: qty === n ? "rgba(0,65,249,0.18)" : "transparent",
                    }}>
                    {n}+
                  </button>
                ))}
                {/* Custom stepper */}
                <div className="flex items-center" style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}>
                  {/* Minus */}
                  <button
                    onClick={() => setQty(q => Math.max(MIN_QTY, (Number(q) || MIN_QTY) - 1))}
                    className="flex items-center justify-center cursor-pointer transition-colors duration-150"
                    style={{ width: 32, height: 36, color: "rgba(255,255,255,0.7)", fontSize: "1.1rem", borderRight: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.background = "rgba(0,65,249,0.2)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >−</button>

                  {/* Input */}
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={e => setQty(e.target.value === "" ? "" : Math.max(MIN_QTY, parseInt(e.target.value) || MIN_QTY))}
                    className="qty-input"
                    style={{
                      width: 56, background: "transparent", border: "none", outline: "none",
                      padding: "8px 4px", textAlign: "center",
                      fontFamily: "var(--font-jetbrains,monospace)",
                      fontSize: "0.62rem", letterSpacing: "0.06em",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  />

                  {/* Plus */}
                  <button
                    onClick={() => setQty(q => (Number(q) || 0) + 1)}
                    className="flex items-center justify-center cursor-pointer transition-colors duration-150"
                    style={{ width: 32, height: 36, color: "rgba(255,255,255,0.7)", fontSize: "1.1rem", borderLeft: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.background = "rgba(0,65,249,0.2)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >+</button>
                </div>
              </div>
              {/* ── Volume Discount Table ── */}
              <div className="mt-3" style={{ border:"1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between" style={{ padding:"8px 12px", borderBottom:"1px solid rgba(255,255,255,0.04)", background:"rgba(255,255,255,0.02)" }}>
                  <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(255,255,255,0.22)" }}>Volume Discounts</span>
                  <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(0,65,249,0.5)" }}>Auto-applied at checkout</span>
                </div>
                {QTY_TIERS.map((tier, i) => {
                  const q        = Number(qty) || 0;
                  const isActive = q >= tier.min && q <= tier.max;
                  const isPassed = q > tier.max;
                  const saving   = QTY_TIERS[0].price - tier.price;
                  const label    = tier.max === Infinity ? `${tier.min}+` : `${tier.min}\u2013${tier.max}`;
                  return (
                    <div key={i} className="flex items-center justify-between transition-all duration-200"
                      style={{
                        padding:"7px 12px",
                        borderLeft:`2px solid ${isActive ? "#0041F9" : "transparent"}`,
                        background: isActive ? "rgba(0,65,249,0.08)" : "transparent",
                        opacity: isPassed ? 0.3 : 1,
                        borderBottom:"1px solid rgba(255,255,255,0.03)",
                      }}>
                      <div className="flex items-center gap-2.5">
                        <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.54rem", letterSpacing:"0.1em", color: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.32)", minWidth:52 }}>
                          {label} <span style={{ fontSize:"0.42rem", color:"rgba(255,255,255,0.18)" }}>units</span>
                        </span>
                        {saving > 0 && (
                          <span style={{
                            fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.08em",
                            color: isActive ? "#4ade80" : "rgba(74,222,128,0.38)",
                            background: isActive ? "rgba(74,222,128,0.08)" : "transparent",
                            padding:"1px 6px",
                          }}>
                            SAVE {Math.round((saving / QTY_TIERS[0].price) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.42rem", letterSpacing:"0.08em", color:"rgba(0,65,249,0.8)" }}>● ACTIVE</span>
                        )}
                        <span style={{ fontFamily:"var(--font-bebas,\'Bebas Neue\')", fontSize:"1.05rem", letterSpacing:"0.04em", color: isActive ? "#F5F5F3" : "rgba(255,255,255,0.28)", lineHeight:1 }}>
                          Quote
                        </span>
                      </div>
                    </div>
                  );
                })}
                {(() => {
                  const q         = Number(qty) || 0;
                  const nextTier  = QTY_TIERS.find(t => q < t.min);
                  if (!nextTier || q === 0) return null;
                  const unitsNeeded = nextTier.min - q;
                  const savingNext  = QTY_TIERS[0].price - nextTier.price;
                  return (
                    <div style={{ padding:"8px 12px", borderTop:"1px solid rgba(255,255,255,0.04)", background:"rgba(0,65,249,0.06)" }}>
                      <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.47rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(0,65,249,0.8)", lineHeight:1.65 }}>
                        ◈ Add {unitsNeeded} more unit{unitsNeeded !== 1 ? "s" : ""} to unlock the next volume discount
                        {savingNext > 0 ? ` · bigger volume savings` : ""}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Live pricing panel — updates with every qty change */}
              <div className="mt-3 p-4" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-end justify-between gap-4">
                  {/* Left: per-unit + breakdown */}
                  <div>
                    <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", marginBottom:4 }}>
                      Price per unit
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={totalPerUnit}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.6rem", letterSpacing:"0.04em", color:"rgba(255,255,255,0.7)", lineHeight:1, display:"block" }}
                      >
                        On Quote
                      </motion.span>
                    </AnimatePresence>
                    {/* Breakdown: base + branding */}
                    <AnimatePresence mode="wait">
                      {brandingCost > 0 ? (
                        <motion.p key="with-branding"
                          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          transition={{ duration: 0.2 }}
                          style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(0,65,249,0.65)", marginTop:3 }}>
                          +£{brandingCost.toFixed(2)} branding per unit
                        </motion.p>
                      ) : (
                        <motion.p key="no-branding"
                          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          transition={{ duration: 0.2 }}
                          style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)", marginTop:3 }}>
                          Min. 10 units · Volume pricing
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Multiply symbol */}
                  <span style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.2rem", color:"rgba(255,255,255,0.18)", marginBottom:18 }}>×</span>

                  {/* Centre: quantity */}
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", marginBottom:4 }}>
                      Quantity
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={String(qty)}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.6rem", letterSpacing:"0.04em", color:"rgba(255,255,255,0.7)", lineHeight:1, display:"block" }}
                      >
                        {qty || "—"}
                      </motion.span>
                    </AnimatePresence>
                    <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)", marginTop:3 }}>
                      units
                    </p>
                  </div>

                  {/* Equals symbol */}
                  <span style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.2rem", color:"rgba(255,255,255,0.18)", marginBottom:18 }}>=</span>

                  {/* Right: total order value */}
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(0,65,249,0.7)", marginBottom:4 }}>
                      Order total
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${totalPerUnit}-${qty}`}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.9rem", letterSpacing:"0.04em", color:"#F5F5F3", lineHeight:1, display:"block" }}
                      >
                        On Quote
                      </motion.span>
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={brandingCost > 0 ? "incl" : "base"}
                        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:3,
                          color: brandingCost > 0 ? "rgba(0,65,249,0.65)" : "rgba(255,255,255,0.18)" }}>
                        {brandingCost > 0 ? "incl. branding" : "excl. branding"}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
        </div>
      </div>

            {/* ══ 2. LOGO UPLOAD ══ */}
      <AnimatePresence>
        {Number(qty) > 0 && (
          <motion.div key="logo" {...reveal}>
            <Divider />
            <div style={{ marginTop: 20 }}>
              <LogoUploadStep
                orderTotal={totalOrder}
                onChange={setLogoResult}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 3. BRANDING METHOD (print or embroidery) ══ */}
      <AnimatePresence>
        {logo === "yes" && (
          <motion.div key="method" {...reveal}>
            <Divider />
            <div style={{ marginTop: 20 }}>
              <Label>Branding Method</Label>
              <div className="flex flex-col gap-2">
                {METHODS.map(m => (
                  <button key={m.id}
                    onClick={() => { setMethod(m.id); setPositions(["Front Centre"]); }}
                    className="flex flex-col gap-3 px-4 py-4 text-left transition-all duration-200 cursor-pointer"
                    style={{
                      border: `1px solid ${method === m.id ? "#0041F9" : "rgba(255,255,255,0.07)"}`,
                      background: method === m.id ? "rgba(0,65,249,0.10)" : "rgba(255,255,255,0.015)",
                    }}>

                    {/* Method name + radio */}
                    <div className="flex items-center gap-3">
                      <div style={{
                        width:14, height:14, borderRadius:"50%", flexShrink:0,
                        border:`1.5px solid ${method === m.id ? "#0041F9" : "rgba(255,255,255,0.2)"}`,
                        background: method === m.id ? "#0041F9" : "transparent",
                        display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
                      }}>
                        {method === m.id && <div style={{ width:5, height:5, borderRadius:"50%", background:"#fff" }}/>}
                      </div>
                      <div>
                        <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.6rem", letterSpacing:"0.1em", textTransform:"uppercase", color: method === m.id ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)", transition:"color 0.2s" }}>
                          {m.label}
                        </p>
                        <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.75rem", color:"rgba(255,255,255,0.3)", lineHeight:1.4, marginTop:2 }}>
                          {m.desc}
                        </p>
                      </div>
                    </div>

                    {/* Price breakdown row */}
                    <div className="flex gap-3 flex-wrap" style={{ paddingLeft: 26 }}>
                      {m.prices.map(p => (
                        <div key={p.pos} className="flex items-center gap-1.5 px-2.5 py-1"
                          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
                          <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>
                            {p.pos}
                          </span>
                          <span style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"0.85rem", letterSpacing:"0.04em", color: method === m.id ? "#0041F9" : "rgba(255,255,255,0.45)" }}>
                            {p.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 4. POSITION ══ */}
      <AnimatePresence>
        {logo === "yes" && method && (
          <motion.div key="pos" {...reveal}>
            <Divider />
            <div style={{ marginTop: 20 }}>
              <Label>Logo Position</Label>

<div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5">
                {POSITIONS.map(pos => {
                  const price = priceKey ? getPositionPrice(pos, priceKey, Number(qty) || 1) : 0;
                  const active = positions.includes(pos);
                  return (
                    <button key={pos}
                      onClick={() => togglePos(pos)}
                      className="flex items-center justify-between px-4 py-3 text-left transition-all duration-200 cursor-pointer"
                      style={{
                        border: `1px solid ${active ? "#0041F9" : "rgba(255,255,255,0.07)"}`,
                        background: active ? "rgba(0,65,249,0.12)" : "rgba(255,255,255,0.015)",
                      }}>
                      <div className="flex items-center gap-2.5">
                        {/* Checkbox */}
                        <div style={{
                          width:12, height:12, flexShrink:0,
                          border:`1.5px solid ${active ? "#0041F9" : "rgba(255,255,255,0.2)"}`,
                          background: active ? "#0041F9" : "transparent",
                          display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
                        }}>
                          {active && (
                            <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                              <path d="M1 3.5L2.8 5.5L6 1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.54rem", letterSpacing:"0.1em", textTransform:"uppercase", color: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.38)", transition:"color 0.2s" }}>
                          {pos}
                        </span>
                      </div>
                      {/* Per-position price */}
                      <span style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"0.9rem", letterSpacing:"0.04em", color: active ? "#0041F9" : "rgba(255,255,255,0.28)", flexShrink:0 }}>
                        {isBoth ? `from £${price.toFixed(2)}` : `+£${price.toFixed(2)}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Running total */}
              <AnimatePresence>
                {positions.length > 0 && (
                  <motion.div key="total"
                    initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    transition={{ duration:0.3 }}
                    className="flex items-center justify-between mt-3 px-4 py-3"
                    style={{ background:"rgba(0,65,249,0.06)", border:"1px solid rgba(0,65,249,0.2)" }}>
                    <div>
                      <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>
                        {isBoth ? "Minimum estimate per unit" : "Estimated price per unit"}
                      </p>
                      <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)", marginTop:2 }}>
                        {isBoth
                          ? "Method split confirmed in quote"
                          : `+£${brandingCost.toFixed(2)} branding per unit`}
                      </p>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <AnimatePresence mode="wait">
                        <motion.span key={totalPerUnit}
                          initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:4 }}
                          transition={{ duration:0.2 }}
                          style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.8rem", letterSpacing:"0.04em", color:"#F5F5F3", lineHeight:1, display:"block" }}>
                          On Quote
                        </motion.span>
                      </AnimatePresence>
                      {qty && Number(qty) > 0 && (
                        <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)", marginTop:2 }}>
                          Final price on quote
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      

      {/* ══ CTA — Add to Basket ══ */}
      <AnimatePresence>
        {canSubmit && (
          <motion.div key="cta" {...reveal}>
            <Divider />
            <div style={{ marginTop: 20 }}>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {[
                  { k:"Size", v: size },
                  { k:"Qty",  v: `${qty || "—"} units` },
                  { k:"Logo", v: logo === "yes" ? (method === "embroidery" ? "Embroidery" : "Print") : "None" },
                  ...(logo === "yes" && positions.length > 0 ? [{ k:"Position", v: positions.join(" + ") }] : []),
                  /* per-unit price hidden — customer receives a personalised quote */
                ].map(item => (
                  <div key={item.k} className="flex items-center gap-1.5 px-3 py-1.5"
                    style={{ border:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
                    <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.22)" }}>{item.k}</span>
                    <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.65)" }}>{item.v}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddToBasket}
                className="w-full flex items-center justify-center gap-3 py-4 cursor-pointer"
                style={{ background:"transparent", border:"1px solid #0041F9", transition:"all 0.25s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,65,249,0.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span style={{fontFamily:"var(--font-jetbrains,monospace)",fontSize:"0.62rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#F5F5F3"}}>
                  Add to Basket →
                </span>
              </button>
              <p style={{fontFamily:"var(--font-jetbrains,monospace)",fontSize:"0.48rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.18)",textAlign:"center",marginTop:8}}>
                Review your full order &amp; checkout from your basket
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
