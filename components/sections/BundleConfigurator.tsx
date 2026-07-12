"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useBasket } from "@/lib/basket-context";
import type { Bundle, BundleLine, ProductKey } from "@/lib/bundles";
import LogoUploadStep, { type LogoUploadResult } from "@/components/ui/LogoUploadStep";

const reveal = {
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const },
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem",
      letterSpacing: "0.2em", textTransform: "uppercase",
      color: "rgba(0,65,249,0.7)", marginBottom: "10px",
    }}>{children}</p>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "4px 0" }} />;
}

/* Product reference for building the chosen outer-layer line */
const PRODUCT_META: Record<string, { name: string; code: string }> = {
  gilet:      { name: "Premium Workwear Gilet",   code: "ELV-005" },
  quarterzip: { name: "Premium Workwear 1/4 Zip", code: "ELV-006" },
  hoodie:     { name: "Premium Workwear Hoodie",  code: "ELV-001" },
  polo:       { name: "Premium Workwear Polo",    code: "ELV-002" },
};
const SIZES_6 = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export default function BundleConfigurator({
  bundle,
  outerKey,
  onOuterChange,
  displaySaving,
  displaySavingPct,
}: {
  bundle: Bundle;
  outerKey?: ProductKey;
  onOuterChange?: (key: ProductKey) => void;
  displaySaving?: number;
  displaySavingPct?: number;
}) {
  const basket = useBasket();
  const shownSaving    = displaySaving    ?? bundle.saving;
  const shownSavingPct = displaySavingPct ?? bundle.savingPct;
  const included = bundle.includedBranding;
  const addonMethod = bundle.addonMethod ?? "embroidery";
  const addons = bundle.addonPlacements ?? [];
  const choice = bundle.choice;

  /* Effective garment lines = fixed lines + chosen outer layer (if any) */
  const effectiveLines: BundleLine[] = useMemo(() => {
    const lines = [...bundle.lines];
    if (choice && outerKey) {
      const meta = PRODUCT_META[outerKey];
      lines.push({
        key: outerKey, name: meta.name, code: meta.code,
        qty: choice.qty, sized: true, sizes: SIZES_6,
        retail: 0, cost: 0,
      });
    }
    return lines;
  }, [bundle.lines, choice, outerKey]);

  /* Free included placement — customer may choose (e.g. Left or Right Chest) */
  const freeOptions = included?.positionOptions ?? (included ? [included.position] : []);
  const [freePosition, setFreePosition] = useState<string>(freeOptions[0] ?? "");

  const [lineSizes, setLineSizes] = useState<Record<number, Record<string, number>>>({});
  const [logoResult,  setLogoResult ] = useState<LogoUploadResult | null>(null);
  const fileName = logoResult?.fileName ?? null;
  const [extraPlaces, setExtraPlaces] = useState<string[]>([]);
  const [notes,       setNotes      ] = useState("");
  const [added,       setAdded      ] = useState(false);

  /* Switching the free placement clears it from any paid extras */
  const chooseFree = (pos: string) => {
    setFreePosition(pos);
    setExtraPlaces(prev => prev.filter(p => p !== pos));
  };

  const setQty = (lineIdx: number, size: string, qty: number) =>
    setLineSizes(prev => ({ ...prev, [lineIdx]: { ...prev[lineIdx], [size]: Math.max(0, qty) } }));

  const lineAssigned = (i: number) =>
    Object.values(lineSizes[i] || {}).reduce((s, q) => s + (q || 0), 0);

  const allSizesComplete = effectiveLines.every((l, i) => lineAssigned(i) === l.qty);
  const totalUnits = effectiveLines.reduce((s, l) => s + l.qty, 0);

  /* Paid placements exclude whichever position is the free one */
  const paidAddons = addons.filter(a => a.position !== freePosition);

  const toggleExtra = (pos: string) =>
    setExtraPlaces(prev => prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]);

  const addonPerUnit = paidAddons.filter(a => extraPlaces.includes(a.position)).reduce((s, a) => s + a.price, 0);
  const addonTotal  = addonPerUnit * totalUnits;
  const orderTotal  = bundle.bundlePrice + addonTotal;

  const canAdd = allSizesComplete && (!included || logoResult !== null);

  const reset = () => {
    setLineSizes({}); setLogoResult(null); setExtraPlaces([]); setNotes(""); setAdded(false);
    setFreePosition(freeOptions[0] ?? "");
  };

  const handleAdd = () => {
    const extras = extraPlaces.filter(p => p !== freePosition);
    const positions = included ? [freePosition, ...extras] : [...extraPlaces];
    basket.addItem({
      productName: bundle.name,
      productCode: bundle.code,
      productHref: `/products/bundles/${bundle.slug}`,
      totalQty: totalUnits,
      logo: included ? "yes" : "no",
      logoFileName: fileName ?? undefined,
      digitisingFee: 0,
      digitisingLabel: "FREE Logo Digitising Included",
      method: included ? addonMethod : null,
      positions,
      notes: notes || undefined,
      basePerUnit: +(bundle.bundlePrice / totalUnits).toFixed(2),
      brandingCost: addonPerUnit,
      totalPerUnit: +(orderTotal / totalUnits).toFixed(2),
      totalOrder: +orderTotal.toFixed(2),
      isBundle: true,
      bundleSlug: bundle.slug,
      bundleImage: bundle.image,
      bundleContents: effectiveLines.map((l, i) => ({
        name: l.name, code: l.code, qty: l.qty,
        sizeQtys: { ...(lineSizes[i] || {}) },
      })),
    });
    setAdded(true);
  };

  /* ── Added state ── */
  if (added) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ border: "1px solid rgba(0,65,249,0.3)", background: "rgba(0,65,249,0.05)", padding: "28px 24px" }}
        className="flex flex-col gap-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-blue flex-shrink-0 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.5rem", letterSpacing:"0.05em", color:"#F5F5F3", lineHeight:1 }}>
            Bundle Added
          </h3>
        </div>
        <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.85rem", color:"rgba(255,255,255,0.42)", lineHeight:1.7 }}>
          {bundle.name} has been added to your basket. Keep shopping or head to checkout.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/basket" style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.16em", textTransform:"uppercase", color:"#0041F9", textDecoration:"none" }}>
            View Basket →
          </Link>
          <button onClick={reset} style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)", cursor:"pointer", textAlign:"left" }}>
            ← Configure another
          </button>
        </div>
      </motion.div>
    );
  }

  /* ── Main flow ── */
  return (
    <div className="flex flex-col gap-7">

      {/* ══ 0. OUTER LAYER CHOICE ══ */}
      {choice && outerKey && onOuterChange && (
        <div>
          <Label>{choice.label} <span style={{ color:"rgba(255,255,255,0.3)" }}>(included)</span></Label>
          <div className="grid grid-cols-2 gap-3">
            {choice.options.map(opt => {
              const active = outerKey === opt.key;
              return (
                <button key={opt.key} onClick={() => onOuterChange(opt.key)}
                  className="group relative flex flex-col"
                  style={{ border:`1px solid ${active?"#0041F9":"rgba(255,255,255,0.1)"}`, background: active?"rgba(0,65,249,0.08)":"rgba(255,255,255,0.01)", cursor:"pointer", transition:"all 0.18s", overflow:"hidden" }}>
                  {/* Thumbnail */}
                  <div className="relative w-full flex items-center justify-center" style={{ aspectRatio:"1/1", background:"#0A0A0E" }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background: active ? "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,65,249,0.12) 0%, transparent 70%)" : "transparent" }}/>
                    <Image src={opt.thumb} alt={opt.label} width={400} height={400}
                      className="relative z-10" style={{ width:"82%", height:"82%", objectFit:"contain", filter: active ? "brightness(1.08)" : "brightness(0.85)", transition:"filter 0.18s" }}/>
                    {/* Radio dot */}
                    <span className="absolute top-2 right-2 z-20" style={{ width:16, height:16, borderRadius:"50%", border:`1px solid ${active?"#0041F9":"rgba(255,255,255,0.3)"}`, background: active?"#0041F9":"rgba(0,0,0,0.4)", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                      {active && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </span>
                  </div>
                  {/* Label */}
                  <div className="w-full px-3 py-2.5" style={{ borderTop:`1px solid ${active?"rgba(0,65,249,0.3)":"rgba(255,255,255,0.06)"}` }}>
                    <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.1em", textTransform:"uppercase", color: active?"#fff":"rgba(255,255,255,0.55)" }}>{opt.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ 1. SIZES PER GARMENT ══ */}
      <div className="flex flex-col gap-5">
        <Label>Select Sizes For Each Item</Label>
        {effectiveLines.map((l, i) => {
          const sizes = l.sized ? (l.sizes ?? []) : ["One Size"];
          const assigned = lineAssigned(i);
          const complete = assigned === l.qty;
          return (
            <div key={`${l.key}-${i}`} style={{ border: `1px solid ${complete ? "rgba(0,65,249,0.35)" : "rgba(255,255,255,0.07)"}`, padding: "12px 14px" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.56rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.75)" }}>
                  {l.qty}× {l.name}
                </span>
                <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.1em", textTransform:"uppercase", color: complete ? "#0041F9" : "rgba(255,255,255,0.3)" }}>
                  {assigned}/{l.qty} assigned
                </span>
              </div>
              {l.sized ? (
                <div className="flex flex-col gap-1.5">
                  {sizes.map(s => {
                    const q = (lineSizes[i]?.[s]) || 0;
                    const active = q > 0;
                    return (
                      <div key={s} className="flex items-center justify-between transition-all duration-150"
                        style={{ padding:"7px 12px", border:`1px solid ${active?"#0041F9":"rgba(255,255,255,0.06)"}`, background: active?"rgba(0,65,249,0.08)":"transparent" }}>
                        <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.56rem", letterSpacing:"0.14em", textTransform:"uppercase", color:active?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.4)" }}>{s}</span>
                        <div className="flex items-center" style={{ border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.03)" }}>
                          <button onClick={() => setQty(i, s, q - 1)}
                            style={{ width:30, height:32, color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:"1rem", borderRight:"1px solid rgba(255,255,255,0.08)", background:"transparent" }}>−</button>
                          <input type="text" inputMode="numeric" value={q === 0 ? "" : String(q)} placeholder="0"
                            onChange={e => {
                              const r = e.target.value.replace(/[^0-9]/g,"");
                              if (r === "") { setQty(i, s, 0); return; }
                              const current = lineSizes[i]?.[s] || 0;
                              const otherAssigned = assigned - current;
                              const remaining = l.qty - otherAssigned;
                              setQty(i, s, Math.min(remaining, parseInt(r, 10)));
                            }}
                            style={{ width:36, height:32, textAlign:"center", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.6rem", color:active?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.4)", background:"transparent", border:"none", outline:"none", caretColor:"#0041F9" }}/>
                          <button onClick={() => assigned < l.qty && setQty(i, s, q + 1)}
                            style={{ width:30, height:32, color:"rgba(255,255,255,0.6)", cursor: assigned < l.qty ? "pointer":"not-allowed", fontSize:"1rem", borderLeft:"1px solid rgba(255,255,255,0.08)", background:"transparent", opacity: assigned < l.qty ? 1 : 0.35 }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)" }}>
                  One size — {l.qty} included automatically
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ══ 2. INCLUDED BRANDING + LOGO UPLOAD ══ */}
      <AnimatePresence>
        {allSizesComplete && included && (
          <motion.div key="branding" {...reveal} className="flex flex-col gap-6">
            <Divider />

            {/* Included callout */}
            <div style={{ border:"1px solid rgba(0,65,249,0.3)", background:"rgba(0,65,249,0.06)", padding:"14px 16px" }} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue flex-shrink-0 flex items-center justify-center">
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#fff" }}>
                  {included.label}
                </p>
              </div>

              {/* Free placement choice */}
              {freeOptions.length > 1 && (
                <div>
                  <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.45)", marginBottom:8 }}>
                    Choose your free logo position
                  </p>
                  <div className="flex flex-col gap-2">
                    {freeOptions.map(pos => {
                      const active = freePosition === pos;
                      return (
                        <button key={pos} onClick={() => chooseFree(pos)}
                          style={{ padding:"10px 12px", border:`1px solid ${active?"#0041F9":"rgba(255,255,255,0.12)"}`, background: active?"rgba(0,65,249,0.14)":"rgba(255,255,255,0.02)", cursor:"pointer", display:"flex", alignItems:"center", gap:9, transition:"all 0.15s" }}>
                          <span style={{ width:13, height:13, borderRadius:"50%", border:`1px solid ${active?"#0041F9":"rgba(255,255,255,0.3)"}`, display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            {active && <span style={{ width:6, height:6, borderRadius:"50%", background:"#0041F9" }}/>}
                          </span>
                          <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.1em", textTransform:"uppercase", color: active?"#fff":"rgba(255,255,255,0.55)" }}>{pos}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(74,222,128,0.7)", marginTop:1 }}>
                {freePosition} embroidery · free on all {totalUnits} garments
              </p>
            </div>

            {/* Logo upload — free digitising on all bundles */}
            <LogoUploadStep freeDigitising={true} orderTotal={bundle.bundlePrice} onChange={setLogoResult} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 3. OPTIONAL EXTRA PLACEMENTS ══ */}
      <AnimatePresence>
        {allSizesComplete && included && paidAddons.length > 0 && (
          <motion.div key="addons" {...reveal}>
            <Divider />
            <div style={{ marginTop: 20 }}>
              <Label>Add Extra Branding Placements <span style={{ color:"rgba(255,255,255,0.3)" }}>(optional)</span></Label>
              <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.78rem", color:"rgba(255,255,255,0.4)", lineHeight:1.6, marginBottom:12 }}>
                Your {freePosition} logo is included free. Add more positions below — priced per garment across all {totalUnits} items.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {paidAddons.map(a => {
                  const active = extraPlaces.includes(a.position);
                  return (
                    <button key={a.position} onClick={() => toggleExtra(a.position)}
                      style={{ padding:"12px 14px", border:`1px solid ${active?"#0041F9":"rgba(255,255,255,0.1)"}`, background: active?"rgba(0,65,249,0.1)":"transparent", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", transition:"all 0.15s" }}>
                      <span className="flex items-center gap-2.5">
                        <span style={{ width:14, height:14, border:`1px solid ${active?"#0041F9":"rgba(255,255,255,0.2)"}`, background: active?"#0041F9":"transparent", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                          {active && <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.54rem", letterSpacing:"0.1em", textTransform:"uppercase", color: active?"#fff":"rgba(255,255,255,0.5)" }}>{a.position}</span>
                      </span>
                      <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.06em", color: active?"#0041F9":"rgba(255,255,255,0.3)" }}>
                        +£{a.price.toFixed(2)}/garment
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 4. NOTES ══ */}
      <AnimatePresence>
        {allSizesComplete && (
          <motion.div key="notes" {...reveal}>
            <Divider />
            <div style={{ marginTop: 20 }}>
              <Label>Notes / Special Instructions (optional)</Label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Logo colours, thread match, specific requirements…"
                style={{ width:"100%", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.1)", padding:"12px", fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.8rem", color:"rgba(255,255,255,0.7)", resize:"vertical", outline:"none" }}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ PRICE SUMMARY ══ */}
      <div className="mt-1 p-4" style={{ border:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>
            Bundle price {included ? "(inc. embroidery)" : ""}
          </span>
          <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.58rem", color:"rgba(255,255,255,0.7)" }}>On Quote</span>
        </div>
        {addonTotal > 0 && (
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(0,65,249,0.7)" }}>
              Extra placements ({totalUnits} units)
            </span>
            <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.58rem", color:"rgba(255,255,255,0.7)" }}>+£{addonTotal.toFixed(2)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#0041F9" }}>Total</span>
          <span style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.9rem", letterSpacing:"0.04em", color:"#F5F5F3", lineHeight:1 }}>On Quote</span>
        </div>
        <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(74,222,128,0.6)", marginTop:6 }}>
          You save {shownSavingPct}% off buying separately
        </p>
      </div>

      {/* ══ ADD TO BASKET ══ */}
      <button
        onClick={canAdd ? handleAdd : undefined}
        disabled={!canAdd}
        style={{
          padding:"16px", border:`1px solid ${canAdd ? "#0041F9" : "rgba(255,255,255,0.1)"}`,
          background: canAdd ? "rgba(0,65,249,0.12)" : "transparent",
          cursor: canAdd ? "pointer" : "not-allowed",
          fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.6rem", letterSpacing:"0.18em",
          textTransform:"uppercase", color: canAdd ? "#fff" : "rgba(255,255,255,0.25)",
          transition:"all 0.2s",
        }}
      >
        {canAdd
          ? "Add Bundle to Basket →"
          : !allSizesComplete
          ? "Assign all sizes to continue"
          : "Upload your logo to continue"}
      </button>
    </div>
  );
}
