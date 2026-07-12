"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import LogoUploadStep, { type LogoUploadResult } from "@/components/ui/LogoUploadStep";
import BrandingPositionStep, { type BrandingResult } from "@/components/ui/BrandingPositionStep";
import { useBasket } from "@/lib/basket-context";

/* ─── Constants ─── */
const SIZES     = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const POSITIONS_LIST = ["Left Chest","Right Chest","Front Centre","Back","Left Shoulder","Right Shoulder"];

type Size     = typeof SIZES[number];




/* ─── Volume pricing tiers ─── */
/* Cost price: £9.12 — blank sell price: £12.99 — tiers always stay above cost */
const QTY_TIERS: { min: number; max: number; price: number }[] = [
  { min: 10,  max: 24,       price: 12.99 },  // +£3.87  30% margin
  { min: 25,  max: 49,       price: 11.99 },  // +£2.87  24% margin
  { min: 50,  max: 99,       price: 10.99 },  // +£1.87  17% margin
  { min: 100, max: 249,      price: 10.49 },  // +£1.37  13% margin
  { min: 250, max: Infinity, price:  9.99 },  // +£0.87   9% margin
];

function unitPrice(q: number | ""): number {
  const n = Number(q) || 0;
  return QTY_TIERS.find(t => n >= t.min && n <= t.max)?.price ?? 12.99;
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
export default function PoloQuoteFlow({ productName }: { productName: string }) {
  const basket = useBasket();

  const [sizeQtys, setSizeQtys] = useState<Record<string,number>>({XS:0,S:0,M:0,L:0,XL:0,XXL:0});
  const [logoResult,     setLogoResult    ] = useState<LogoUploadResult | null>(null);
  const [brandingResult, setBrandingResult] = useState<BrandingResult | null>(null);
  const logo       = logoResult ? (logoResult.hasLogo ? "yes" : "no") : null;
  const fileName   = logoResult?.fileName ?? null;
  const digitising = logoResult?.digitising ?? null;
  const [notes,     setNotes    ] = useState("");
  const [addedToBasket, setAddedToBasket] = useState(false);

  const totalQty    = SIZES.reduce((s, sz) => s + (sizeQtys[sz] || 0), 0);
  const basePerUnit  = unitPrice(totalQty);
    const brandingCost  = brandingResult?.brandingCostPerUnit ?? 0;
  const totalPerUnit  = basePerUnit + brandingCost;
  const totalOrder    = totalPerUnit * totalQty;

  const canSubmit =
    totalQty > 0 &&
    logoResult !== null &&
    (logo === "no" || brandingResult !== null);

  const reset = () => {
    setSizeQtys({XS:0,S:0,M:0,L:0,XL:0,XXL:0}); setLogoResult(null); setBrandingResult(null);
    setNotes("");     setAddedToBasket(false);
  };

  const handleAddToBasket = () => {
    basket.addItem({
      productName,
      productCode: "ELV-002",
      productHref: "/products/polo-shirts/workwear-polo",
      sizeQtys: { ...sizeQtys },
      totalQty,
      logo: logo!,
      logoFileName: brandingResult?.sharedLogoFile ?? fileName ?? undefined,
      digitisingFee: digitising?.fee,
      digitisingLabel: digitising?.label,
      method: brandingResult?.positions[0]?.method ?? null,
      positions: brandingResult?.positions.map(p=>p.position) ?? [],
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

      {/* ══ 1. SIZE & QUANTITY PER SIZE ══ */}
      <div>
        <Label>Select Sizes &amp; Quantities</Label>
        <div className="flex flex-col gap-1.5">
          {SIZES.map(s => {
            const q = sizeQtys[s] || 0;
            const active = q > 0;
            return (
              <div key={s} className="flex items-center justify-between transition-all duration-150"
                style={{
                  padding:"10px 14px",
                  border:`1px solid ${active?"#0041F9":"rgba(255,255,255,0.07)"}`,
                  background: active?"rgba(0,65,249,0.08)":"transparent",
                }}>
                <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.6rem", letterSpacing:"0.14em", textTransform:"uppercase", color:active?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.4)" }}>
                  {s}
                </span>
                <div className="flex items-center" style={{ border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.03)" }}>
                  <button
                    onClick={() => setSizeQtys(p => ({...p,[s]:Math.max(0,(p[s]||0)-1)}))}
                    style={{ width:32, height:34, color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:"1rem", borderRight:"1px solid rgba(255,255,255,0.08)", background:"transparent", transition:"all 0.15s" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color="#fff";(e.currentTarget as HTMLElement).style.background="rgba(0,65,249,0.2)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.6)";(e.currentTarget as HTMLElement).style.background="transparent";}}>
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={q === 0 ? "" : String(q)}
                    placeholder="0"
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      const val = raw === "" ? 0 : Math.min(9999, parseInt(raw, 10));
                      setSizeQtys(p => ({...p,[s]:val}));
                    }}
                    style={{
                      width:40, height:34, textAlign:"center",
                      fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.62rem",
                      color:active?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.4)",
                      background:"transparent", border:"none", outline:"none",
                      caretColor:"#0041F9",
                    }}
                  />
                  <button
                    onClick={() => setSizeQtys(p => ({...p,[s]:(p[s]||0)+1}))}
                    style={{ width:32, height:34, color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:"1rem", borderLeft:"1px solid rgba(255,255,255,0.08)", background:"transparent", transition:"all 0.15s" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color="#fff";(e.currentTarget as HTMLElement).style.background="rgba(0,65,249,0.2)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.6)";(e.currentTarget as HTMLElement).style.background="transparent";}}>
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Volume Discount Table ── */}
        <div className="mt-3" style={{ border:"1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center justify-between" style={{ padding:"8px 12px", borderBottom:"1px solid rgba(255,255,255,0.04)", background:"rgba(255,255,255,0.02)" }}>
            <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.48rem", fontWeight:600, color:"rgba(255,255,255,0.45)" }}>Volume Discounts</span>
            <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.44rem", fontWeight:500, color:"rgba(0,65,249,0.65)" }}>Auto-applied at checkout</span>
          </div>
          {QTY_TIERS.map((tier, i) => {
            const isActive = totalQty >= tier.min && totalQty <= tier.max;
            const isPassed = totalQty > tier.max;
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
            const nextTier    = QTY_TIERS.find(t => totalQty < t.min);
            if (!nextTier || totalQty === 0) return null;
            const unitsNeeded = nextTier.min - totalQty;
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

      </div>

      {/* Live total + pricing - shown via CTA chips */}

      


      {/* ══ 2. LOGO UPLOAD ══ */}
      <AnimatePresence>
        {totalQty > 0 && (
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

      {/* ══ 3. BRANDING POSITIONS ══ */}
      <AnimatePresence>
        {logo === "yes" && (
          <motion.div key="branding" {...reveal}>
            <Divider />
            <div style={{ marginTop: 20 }}>
              <BrandingPositionStep
                availablePositions={POSITIONS_LIST}
                qty={totalQty}
                onChange={setBrandingResult}
              />
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
                  { k:"Sizes", v: SIZES.filter(s=>sizeQtys[s]>0).map(s=>`${sizeQtys[s]}×${s}`).join(", ") || "—" },
                  { k:"Total", v: `${totalQty} units` },
                  { k:"Logo", v: logo === "yes" ? (brandingResult?.positions?.[0]?.method === "embroidery" ? "Embroidery" : "Print") : "None" },
                  ...(logo === "yes" && (brandingResult?.positions?.length ?? 0) > 0 ? [{ k:"Position", v: brandingResult!.positions.map(p=>p.position).join(" + ") }] : []),
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
