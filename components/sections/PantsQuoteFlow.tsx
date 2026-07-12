"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import LogoUploadStep, { type LogoUploadResult } from "@/components/ui/LogoUploadStep";
import { useBasket } from "@/lib/basket-context";
import { getPositionPrice, getUnitPrice } from "@/lib/product-pricing";

/* ─── Constants ─── */
// Pants: sized XS–XXL, single branding position (Left Leg) — no chest/back
// diagram makes sense for trousers, so this uses an inline picker like the
// one-size flows rather than the torso-silhouette BrandingPositionStep.
const POSITIONS = ["Left Leg"] as const;
const SIZES = ["XS","S","M","L","XL","XXL"] as const;

type Position = typeof POSITIONS[number];
type Method   = "embroidery" | "print" | null;

const METHODS = [
  {
    id:    "embroidery" as const,
    label: "Embroidery",
    desc:  "Stitched directly into fabric. Durable, raised finish. Industry standard.",
  },
  {
    id:    "print" as const,
    label: "Print",
    desc:  "High-definition DTG or screen print. Ideal for complex designs.",
  },
];

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
export default function PantsQuoteFlow({ productName }: { productName: string }) {
  const basket = useBasket();

  const [sizeQtys, setSizeQtys] = useState<Record<string,number>>({XS:0,S:0,M:0,L:0,XL:0,XXL:0});
  const [logoResult, setLogoResult] = useState<LogoUploadResult | null>(null);
  const logo       = logoResult ? (logoResult.hasLogo ? "yes" : "no") : null;
  const fileName   = logoResult?.fileName ?? null;
  const digitising = logoResult?.digitising ?? null;
  const [method,    setMethod   ] = useState<Method>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [notes,     setNotes    ] = useState("");
  const [addedToBasket, setAddedToBasket] = useState(false);

  const togglePos = (pos: Position) =>
    setPositions(prev =>
      prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
    );

  const totalQty     = SIZES.reduce((s, sz) => s + (sizeQtys[sz] || 0), 0);
  const basePerUnit  = getUnitPrice("ELV-013", totalQty);
  const priceKey     = method;
  const brandingCost = priceKey
    ? positions.reduce((sum, pos) => sum + getPositionPrice(pos, priceKey, totalQty || 1), 0)
    : 0;
  const totalPerUnit = basePerUnit + brandingCost;
  const totalOrder   = totalPerUnit * totalQty;

  const canSubmit =
    totalQty > 0 &&
    logoResult !== null &&
    (logo === "no" || (method !== null && positions.length > 0));

  const reset = () => {
    setSizeQtys({XS:0,S:0,M:0,L:0,XL:0,XXL:0}); setLogoResult(null); setMethod(null);
    setPositions([]); setNotes("");     setAddedToBasket(false);
  };

  const handleAddToBasket = () => {
    basket.addItem({
      productName,
      productCode: "ELV-013",
      productHref: "/products/ppe/workwear-pants",
      sizeQtys: { ...sizeQtys },
      totalQty,
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
                  <button onClick={() => setSizeQtys(p => ({...p,[s]:Math.max(0,(p[s]||0)-1)}))}
                    style={{ width:32, height:34, color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:"1rem", borderRight:"1px solid rgba(255,255,255,0.08)", background:"transparent", transition:"all 0.15s" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color="#fff";(e.currentTarget as HTMLElement).style.background="rgba(0,65,249,0.2)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.6)";(e.currentTarget as HTMLElement).style.background="transparent";}}>−</button>
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
                  <button onClick={() => setSizeQtys(p => ({...p,[s]:(p[s]||0)+1}))}
                    style={{ width:32, height:34, color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:"1rem", borderLeft:"1px solid rgba(255,255,255,0.08)", background:"transparent", transition:"all 0.15s" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color="#fff";(e.currentTarget as HTMLElement).style.background="rgba(0,65,249,0.2)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.6)";(e.currentTarget as HTMLElement).style.background="transparent";}}>+</button>
                </div>
              </div>
            );
          })}
        </div>

        {totalQty > 0 && (
          <div className="mt-3 p-4" style={{ border:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", marginBottom:4 }}>Price per unit</p>
                <p style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.4rem", letterSpacing:"0.04em", color:"rgba(255,255,255,0.7)", lineHeight:1 }}>On Quote</p>
                {brandingCost > 0 && <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(0,65,249,0.65)", marginTop:3 }}>+£{brandingCost.toFixed(2)} branding per unit</p>}
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(0,65,249,0.7)", marginBottom:4 }}>Order Total</p>
                <p style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.9rem", letterSpacing:"0.04em", color:"#F5F5F3", lineHeight:1 }}>On Quote</p>
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)", marginTop:3 }}>{totalQty} units total</p>
              </div>
            </div>
          </div>
        )}
      </div>

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

      {/* ══ 3. BRANDING METHOD ══ */}
      <AnimatePresence>
        {logo === "yes" && (
          <motion.div key="method" {...reveal}>
            <Divider />
            <div style={{ marginTop: 20 }}>
              <Label>Branding Method</Label>
              <div className="flex flex-col gap-2">
                {METHODS.map(m => (
                  <button key={m.id}
                    onClick={() => { setMethod(m.id); setPositions(["Left Leg"]); }}
                    className="flex flex-col gap-3 px-4 py-4 text-left transition-all duration-200 cursor-pointer"
                    style={{
                      border: `1px solid ${method === m.id ? "#0041F9" : "rgba(255,255,255,0.07)"}`,
                      background: method === m.id ? "rgba(0,65,249,0.10)" : "rgba(255,255,255,0.015)",
                    }}>
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
                    <div className="flex gap-3 flex-wrap" style={{ paddingLeft: 26 }}>
                      <div className="flex items-center gap-1.5 px-2.5 py-1"
                        style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>
                          Left Leg
                        </span>
                        <span style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"0.85rem", letterSpacing:"0.04em", color: method === m.id ? "#0041F9" : "rgba(255,255,255,0.45)" }}>
                          +£{getPositionPrice("Left Leg", m.id, totalQty || 1).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
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
                  { k:"Logo", v: logo === "yes" ? (method === "embroidery" ? "Embroidery" : "Print") : "None" },
                  ...(logo === "yes" && positions.length > 0 ? [{ k:"Position", v: positions.join(" + ") }] : []),
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
