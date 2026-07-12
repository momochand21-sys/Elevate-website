"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BasketItem } from "@/lib/basket-context";
import { calcLine, POSITION_PRICE, type ProductCode, type BrandingMethod } from "@/lib/product-pricing";

const SIZES_ALL = ["XS","S","M","L","XL","XXL","One Size"] as const;

/** Allowed branding positions per product code */
const PRODUCT_POSITIONS: Record<string, string[]> = {
  "ELV-001": ["Left Chest","Right Chest","Front Centre","Back","Left Shoulder","Right Shoulder"], // Hoodie
  "ELV-002": ["Left Chest","Right Chest","Front Centre","Back","Left Shoulder","Right Shoulder"], // Polo
  "ELV-003": ["Front Centre"],                                                                    // Beanie
  "ELV-004": ["Front Centre"],                                                                    // Cap
  "ELV-005": ["Left Chest","Right Chest","Front Centre","Back"],                                  // Gilet
  "ELV-006": ["Left Chest","Right Chest","Front Centre","Back","Left Shoulder","Right Shoulder"], // 1/4 Zip
};

const FALLBACK_POSITIONS = ["Left Chest","Right Chest","Front Centre","Back","Left Shoulder","Right Shoulder"];

const MONO: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains,monospace)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};
const BEBAS: React.CSSProperties = {
  fontFamily: "var(--font-bebas,'Bebas Neue')",
  letterSpacing: "0.04em",
};

interface Props {
  item: BasketItem;
  onSave: (patch: Partial<Omit<BasketItem,"id">>) => void;
  onClose: () => void;
}

export default function BasketItemEditor({ item, onSave, onClose }: Props) {
  const code = item.productCode as ProductCode;

  /* Get the allowed positions for this product */
  const allowedPositions = PRODUCT_POSITIONS[code] ?? FALLBACK_POSITIONS;

  /* Validate and sanitise existing positions on mount */
  const sanitisePositions = (raw: string[]): string[] => {
    const valid = raw.filter(p => allowedPositions.includes(p));
    const invalid = raw.filter(p => !allowedPositions.includes(p));
    if (invalid.length > 0) {
      console.warn(
        `[BasketItemEditor] ${code} (${item.productName}): removed invalid positions:`,
        invalid,
        `→ falling back to allowed positions for this product:`,
        allowedPositions
      );
    }
    // If nothing valid remains and product allows Front Centre, default to it
    if (valid.length === 0 && allowedPositions.includes("Front Centre")) {
      return ["Front Centre"];
    }
    return valid;
  };

  /* Local editable state */
  const [sizeQtys,  setSizeQtys  ] = useState<Record<string,number>>({ ...(item.sizeQtys ?? {}) });
  const [method,    setMethod    ] = useState<BrandingMethod>(
    (item.method as BrandingMethod) ?? "embroidery"
  );
  const [positions, setPositions ] = useState<string[]>(sanitisePositions(item.positions ?? []));
  const [notes,     setNotes     ] = useState(item.notes ?? "");

  /* Relevant sizes — only show sizes already in the item or with qty > 0 */
  const activeSizes = SIZES_ALL.filter(s =>
    (sizeQtys[s] ?? 0) > 0 || (item.sizeQtys ?? {})[s] !== undefined
  );
  // Also show a minimal set if nothing is set
  const displaySizes = activeSizes.length > 0 ? activeSizes : ["XS","S","M","L","XL","XXL"] as string[];

  const totalQty = Object.values(sizeQtys).reduce((s,v) => s+(v||0), 0);

  /* Live pricing */
  const pricing = calcLine(code, totalQty, positions, method);

  const togglePosition = (p: string) =>
    setPositions(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev,p]);

  const handleSave = () => {
    onSave({
      sizeQtys:     { ...sizeQtys },
      totalQty,
      method,
      positions:    [...positions],
      notes,
      basePerUnit:  pricing.basePerUnit,
      brandingCost: pricing.brandingCost,
      totalPerUnit: pricing.totalPerUnit,
      totalOrder:   pricing.totalOrder,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[700] flex items-center justify-center p-4"
      style={{ background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity:0, scale:0.97, y:12 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.97 }}
        transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
        onClick={e=>e.stopPropagation()}
        style={{ background:"#0A0A0E", border:"1px solid rgba(255,255,255,0.1)", width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between" style={{ padding:"24px 24px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <p style={{ ...MONO, fontSize:"0.46rem", color:"rgba(0,65,249,0.7)", marginBottom:4 }}>{item.productCode} · Edit Item</p>
            <h2 style={{ ...BEBAS, fontSize:"1.5rem", color:"#F5F5F3", lineHeight:1 }}>{item.productName}</h2>
          </div>
          <button onClick={onClose} style={{ cursor:"pointer", color:"rgba(255,255,255,0.35)", background:"none", border:"none", fontSize:"1.2rem", marginTop:2 }}>✕</button>
        </div>

        <div className="flex flex-col gap-6" style={{ padding:"20px 24px 24px" }}>

          {/* ── Sizes ── */}
          <div>
            <p style={{ ...MONO, fontSize:"0.48rem", color:"rgba(0,65,249,0.7)", marginBottom:10 }}>Sizes &amp; Quantities</p>
            <div className="flex flex-col gap-1.5">
              {displaySizes.map(s => {
                const q = sizeQtys[s] || 0;
                const active = q > 0;
                return (
                  <div key={s} className="flex items-center justify-between transition-all duration-150"
                    style={{ padding:"7px 12px", border:`1px solid ${active?"#0041F9":"rgba(255,255,255,0.07)"}`, background:active?"rgba(0,65,249,0.08)":"transparent" }}>
                    <span style={{ ...MONO, fontSize:"0.55rem", color:active?"#fff":"rgba(255,255,255,0.4)" }}>{s}</span>
                    <div className="flex items-center" style={{ border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.03)" }}>
                      <button onClick={()=>setSizeQtys(p=>({...p,[s]:Math.max(0,(p[s]||0)-1)}))}
                        style={{ width:30,height:32,cursor:"pointer",fontSize:"1rem",borderRight:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"rgba(255,255,255,0.6)" }}>−</button>
                      <input type="text" inputMode="numeric" value={q===0?"":String(q)} placeholder="0"
                        onChange={e=>{const r=e.target.value.replace(/[^0-9]/g,"");setSizeQtys(p=>({...p,[s]:r===""?0:parseInt(r,10)}));}}
                        style={{ width:36,height:32,textAlign:"center",...MONO,fontSize:"0.58rem",color:active?"#fff":"rgba(255,255,255,0.4)",background:"transparent",border:"none",outline:"none",caretColor:"#0041F9" }}/>
                      <button onClick={()=>setSizeQtys(p=>({...p,[s]:(p[s]||0)+1}))}
                        style={{ width:30,height:32,cursor:"pointer",fontSize:"1rem",borderLeft:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"rgba(255,255,255,0.6)" }}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p style={{ ...MONO, fontSize:"0.46rem", color:"rgba(255,255,255,0.28)" }}>Total units</p>
              <p style={{ ...BEBAS, fontSize:"1.2rem", color:"#F5F5F3", lineHeight:1 }}>{totalQty}</p>
            </div>
          </div>

          {/* ── Branding Method ── */}
          <div>
            <p style={{ ...MONO, fontSize:"0.48rem", color:"rgba(0,65,249,0.7)", marginBottom:10 }}>Branding Method</p>
            <div className="grid grid-cols-3 gap-2">
              {(["embroidery","print","both"] as const).map(m => (
                <button key={m} onClick={()=>setMethod(m)}
                  style={{ padding:"10px 8px", border:`1px solid ${method===m?"#0041F9":"rgba(255,255,255,0.1)"}`,
                    background:method===m?"rgba(0,65,249,0.1)":"transparent",
                    cursor:"pointer",...MONO,fontSize:"0.5rem",color:method===m?"#fff":"rgba(255,255,255,0.4)",transition:"all 0.15s" }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* ── Positions ── */}
          <div>
            <p style={{ ...MONO, fontSize:"0.48rem", color:"rgba(0,65,249,0.7)", marginBottom:10 }}>
              Branding Positions
              {totalQty > 0 && <span style={{ color:"rgba(255,255,255,0.3)", marginLeft:8 }}>
                +£{pricing.brandingCost.toFixed(2)}/unit
              </span>}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {allowedPositions.map(p => {
                const active = positions.includes(p);
                const priceKey = method==="both"?"embroidery":method;
                const cost = POSITION_PRICE[p]?.[priceKey] ?? 0;
                return (
                  <button key={p} onClick={()=>togglePosition(p)}
                    style={{ padding:"9px 12px", border:`1px solid ${active?"#0041F9":"rgba(255,255,255,0.08)"}`,
                      background:active?"rgba(0,65,249,0.1)":"transparent", cursor:"pointer",
                      display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all 0.15s" }}>
                    <span style={{ ...MONO,fontSize:"0.5rem",color:active?"#fff":"rgba(255,255,255,0.45)" }}>{p}</span>
                    <span style={{ ...MONO,fontSize:"0.46rem",color:active?"#0041F9":"rgba(255,255,255,0.25)" }}>+£{cost.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Notes ── */}
          <div>
            <p style={{ ...MONO, fontSize:"0.48rem", color:"rgba(0,65,249,0.7)", marginBottom:8 }}>Notes (optional)</p>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
              placeholder="Logo colours, thread match, special instructions…"
              style={{ width:"100%",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.1)",padding:"10px 12px",fontFamily:"var(--font-dm-sans,sans-serif)",fontSize:"0.82rem",color:"rgba(255,255,255,0.7)",resize:"vertical",outline:"none" }}/>
          </div>

          {/* ── Live pricing ── */}
          <div style={{ padding:"12px 14px",border:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.02)" }}>
            <div className="flex items-center justify-between mb-1">
              <span style={{ ...MONO,fontSize:"0.46rem",color:"rgba(255,255,255,0.3)" }}>Unit price (base)</span>
              <span style={{ ...MONO,fontSize:"0.52rem",color:"rgba(255,255,255,0.6)" }}>On Quote</span>
            </div>
            {pricing.brandingCost > 0 && (
              <div className="flex items-center justify-between mb-1">
                <span style={{ ...MONO,fontSize:"0.46rem",color:"rgba(255,255,255,0.3)" }}>Branding</span>
                <span style={{ ...MONO,fontSize:"0.52rem",color:"rgba(0,65,249,0.8)" }}>+£{pricing.brandingCost.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between" style={{ paddingTop:8,borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ ...MONO,fontSize:"0.48rem",color:"rgba(0,65,249,0.8)" }}>Line Total ({totalQty} units)</span>
              <span style={{ ...BEBAS,fontSize:"1.6rem",color:"#F5F5F3",lineHeight:1 }}>On Quote</span>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={totalQty===0}
              style={{ flex:1,padding:"13px",background:totalQty>0?"#0041F9":"rgba(0,65,249,0.25)",border:"none",cursor:totalQty>0?"pointer":"not-allowed",...MONO,fontSize:"0.58rem",color:"#fff",transition:"background 0.15s" }}>
              Save Changes →
            </button>
            <button onClick={onClose}
              style={{ flex:1,padding:"13px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",cursor:"pointer",...MONO,fontSize:"0.58rem",color:"rgba(255,255,255,0.4)" }}>
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
