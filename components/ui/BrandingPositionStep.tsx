"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { POSITION_PRICE, getPositionPrice } from "@/lib/product-pricing";

/* ─── Where the logo dot sits on the diagram image ────────────── */
const POS_LAYOUT: Record<string, { view: "front"|"back"; x: string; y: string; size?: string }> = {
  "Left Chest":     { view: "front", x: "36%",  y: "42%" },
  "Right Chest":    { view: "front", x: "60%",  y: "42%" },
  "Front Centre":   { view: "front", x: "48%",  y: "43%" },
  "Left Shoulder":  { view: "front", x: "12%",  y: "38%", size: "10px" },
  "Right Shoulder": { view: "front", x: "88%",  y: "38%", size: "10px" },
  "Back":           { view: "back",  x: "48%",  y: "44%" },
};

/* ─── Types ────────────────────────────────────────────────────── */
export interface PositionConfig {
  position:    string;
  method:      "embroidery" | "print";
  logoFileName?: string;   // undefined = use the shared logo
}

export interface BrandingResult {
  positions:        PositionConfig[];
  sharedLogoFile?:  string;
  brandingCostPerUnit: number;
}

interface Props {
  availablePositions: string[];
  qty?: number;
  onChange: (result: BrandingResult | null) => void;
}

const reveal = {
  initial:    { opacity: 0, y: 12 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.78rem",
      fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase",
      color:"rgba(0,65,249,0.8)", marginBottom:10 }}>
      {children}
    </p>
  );
}

export default function BrandingPositionStep({ availablePositions, qty = 1, onChange }: Props) {
  /* Which positions are selected */
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  /* Per-position method */
  const [methods, setMethods] = useState<Record<string, "embroidery"|"print">>({});
  /* Per-position logo file (optional — overrides shared) */
  const [posLogos, setPosLogos] = useState<Record<string, string>>({});
  /* Shared logo file */
  const [sharedLogo, setSharedLogo] = useState<string | null>(null);
  /* Whether to use different logos per position */
  const [perPosLogos, setPerPosLogos] = useState(false);

  const sharedFileRef = useRef<HTMLInputElement>(null);
  const posFileRefs   = useRef<Record<string, HTMLInputElement | null>>({});

  const selectedPositions = availablePositions.filter(p => selected[p]);

  /* Recalculate brandingCostPerUnit whenever qty changes (tier may have shifted) */
  useEffect(() => {
    if (selectedPositions.length > 0) {
      emit(selected, methods, posLogos, sharedLogo, perPosLogos);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qty]);

  const emit = (
    sel: Record<string, boolean>,
    mth: Record<string, "embroidery"|"print">,
    pLogo: Record<string, string>,
    sLogo: string | null,
    ppl: boolean,
  ) => {
    const positions = availablePositions.filter(p => sel[p]);
    if (positions.length === 0) { onChange(null); return; }

    const configs: PositionConfig[] = positions.map(p => ({
      position: p,
      method:   mth[p] ?? "embroidery",
      logoFileName: ppl ? pLogo[p] : undefined,
    }));

    const brandingCostPerUnit = configs.reduce((sum, c) => {
      return sum + getPositionPrice(c.position, c.method, qty);
    }, 0);

    onChange({ positions: configs, sharedLogoFile: sLogo ?? undefined, brandingCostPerUnit });
  };

  const togglePosition = (pos: string) => {
    const next = { ...selected, [pos]: !selected[pos] };
    if (!next[pos]) {
      const newMth = { ...methods }; delete newMth[pos];
      const newPL  = { ...posLogos }; delete newPL[pos];
      setMethods(newMth); setPosLogos(newPL);
      setSelected(next);
      emit(next, newMth, newPL, sharedLogo, perPosLogos);
    } else {
      const newMth = { ...methods, [pos]: methods[pos] ?? "embroidery" };
      setMethods(newMth); setSelected(next);
      emit(next, newMth, posLogos, sharedLogo, perPosLogos);
    }
  };

  const setMethod = (pos: string, m: "embroidery"|"print") => {
    const next = { ...methods, [pos]: m };
    setMethods(next);
    emit(selected, next, posLogos, sharedLogo, perPosLogos);
  };

  const handlePosFile = (pos: string, file: File) => {
    const next = { ...posLogos, [pos]: file.name };
    setPosLogos(next);
    emit(selected, methods, next, sharedLogo, perPosLogos);
  };

  const handleSharedFile = (file: File) => {
    setSharedLogo(file.name);
    emit(selected, methods, posLogos, file.name, perPosLogos);
  };

  const togglePerPos = (v: boolean) => {
    setPerPosLogos(v);
    emit(selected, methods, posLogos, sharedLogo, v);
  };

  /* Split into front/back groups for the two rows */
  const frontPositions = availablePositions.filter(p => POS_LAYOUT[p]?.view === "front");
  const backPositions  = availablePositions.filter(p => POS_LAYOUT[p]?.view === "back");

  const renderCard = (pos: string) => {
    const layout   = POS_LAYOUT[pos];
    const isActive = !!selected[pos];
    const method   = methods[pos] ?? "embroidery";
    const dotSize  = layout?.size ?? "14px";
    const prices   = POSITION_PRICE[pos];

    return (
      <div key={pos} className="flex flex-col" style={{ gap: 0 }}>
        {/* Clickable garment card */}
        <button
          onClick={() => togglePosition(pos)}
          className="relative flex flex-col items-center transition-all duration-200"
          style={{
            border: `1px solid ${isActive ? "#0041F9" : "rgba(255,255,255,0.08)"}`,
            background: isActive ? "rgba(0,65,249,0.07)" : "rgba(255,255,255,0.01)",
            padding: "10px 8px 8px",
            cursor: "pointer",
          }}>
          {/* Selected tick */}
          {isActive && (
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background:"#0041F9" }}>
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}

          {/* Garment diagram with position dot */}
          <div className="relative" style={{ width:"100%", maxWidth:90, aspectRatio:"3/4", margin:"0 auto" }}>
            <Image
              src={`/products/diagram-${layout?.view ?? "front"}.png`}
              alt={pos} fill style={{ objectFit:"contain" }}/>
            {/* Position indicator dot */}
            {layout && (
              <div className="absolute" style={{
                left: layout.x, top: layout.y,
                width: dotSize, height: dotSize,
                background: isActive ? "#0041F9" : "rgba(255,255,255,0.5)",
                borderRadius: "50%",
                transform: "translate(-50%,-50%)",
                boxShadow: isActive ? "0 0 8px rgba(0,65,249,0.8)" : "none",
                transition: "all 0.2s",
              }}/>
            )}
          </div>

          {/* Position name */}
          <p style={{
            fontFamily: "var(--font-dm-sans,sans-serif)",
            fontSize: "0.78rem", fontWeight: 500,
            color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
            marginTop: 8, textAlign: "center",
          }}>{pos}</p>
        </button>

        {/* Method + price — shown when selected */}
        <AnimatePresence>
          {isActive && (
            <motion.div key={`${pos}-method`} {...reveal}
              style={{ border:"1px solid rgba(0,65,249,0.2)", borderTop:"none", background:"rgba(0,65,249,0.04)", padding:"8px" }}>
              <div className="flex flex-col gap-1.5">
                {(["embroidery","print"] as const).map(m => (
                  <button key={m} onClick={() => setMethod(pos, m)}
                    className="flex items-center justify-between w-full"
                    style={{ cursor:"pointer", padding:"5px 7px",
                      background: method===m ? "rgba(0,65,249,0.15)" : "transparent",
                      border: `1px solid ${method===m ? "rgba(0,65,249,0.4)" : "rgba(255,255,255,0.06)"}`,
                      transition:"all 0.15s" }}>
                    <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.82rem",
                      fontWeight: 500,
                      color: method===m ? "#fff" : "rgba(255,255,255,0.5)" }}>
                      {m === "embroidery" ? "Embroidery" : "Print"}
                    </span>
                    <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.82rem",
                      fontWeight: 600,
                      color: method===m ? "#0041F9" : "rgba(255,255,255,0.35)" }}>
                      +£{getPositionPrice(pos, m, qty).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Per-position logo upload (if multi-logo mode) */}
              {perPosLogos && (
                <div style={{ marginTop:8, borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:8 }}>
                  <input type="file" accept=".png,.jpg,.jpeg,.pdf,.svg,.ai,.eps,.dst,.pes,.exp,.dsb"
                    className="hidden"
                    ref={el => { posFileRefs.current[pos] = el; }}
                    onChange={e => { const f=e.target.files?.[0]; if(f) handlePosFile(pos, f); }}/>
                  <button onClick={() => posFileRefs.current[pos]?.click()}
                    style={{ width:"100%", padding:"5px 6px", textAlign:"center",
                      border:`1px dashed ${posLogos[pos] ? "rgba(0,65,249,0.5)" : "rgba(255,255,255,0.15)"}`,
                      background:"transparent", cursor:"pointer" }}>
                    <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.82rem",
                      color: posLogos[pos] ? "#0041F9" : "rgba(255,255,255,0.4)" }}>
                      {posLogos[pos] ? `✓ ${posLogos[pos].length>16 ? posLogos[pos].slice(0,14)+"…" : posLogos[pos]}` : "Upload logo"}
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Front positions ── */}
      <div>
        <SectionLabel>Select Branding Positions</SectionLabel>
        <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.88rem",
          color:"rgba(255,255,255,0.42)", lineHeight:1.6, marginBottom:12 }}>
          Tap a position to select it. Choose embroidery or print per position. Select multiple.
        </p>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(frontPositions.length, 3)}, 1fr)` }}>
          {frontPositions.map(renderCard)}
        </div>
      </div>

      {/* ── Back positions ── */}
      {backPositions.length > 0 && (
        <div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(backPositions.length, 3)}, 1fr)` }}>
            {backPositions.map(renderCard)}
          </div>
        </div>
      )}

      {/* ── Selected summary ── */}
      <AnimatePresence>
        {selectedPositions.length > 0 && (
          <motion.div key="summary" {...reveal}
            style={{ border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)", padding:"12px 14px" }}>
            <div className="flex items-center justify-between mb-2">
              <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.82rem",
                fontWeight:600, color:"rgba(255,255,255,0.5)" }}>
                Selected Positions
              </p>
              <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.88rem",
                fontWeight:700, color:"rgba(0,65,249,0.9)" }}>
                +£{selectedPositions.reduce((s,p) => s + getPositionPrice(p, methods[p]??"embroidery", qty), 0).toFixed(2)}/unit
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedPositions.map(p => (
                <span key={p} style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.78rem",
                  fontWeight:500, color:"#fff", background:"rgba(0,65,249,0.2)",
                  border:"1px solid rgba(0,65,249,0.4)", padding:"4px 10px" }}>
                  {p} · {methods[p] ?? "embroidery"}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Logo upload section ── */}
      <AnimatePresence>
        {selectedPositions.length > 0 && (
          <motion.div key="logos" {...reveal} className="flex flex-col gap-4">

            {/* Multiple logos toggle */}
            {selectedPositions.length > 1 && (
              <div>
                <SectionLabel>Logo Options</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { v:false, label:"Same logo on all positions" },
                    { v:true,  label:"Different logo per position" },
                  ] as const).map(opt => (
                    <button key={String(opt.v)} onClick={() => togglePerPos(opt.v)}
                      style={{ padding:"11px 10px", border:`1px solid ${perPosLogos===opt.v?"#0041F9":"rgba(255,255,255,0.1)"}`,
                        background: perPosLogos===opt.v?"rgba(0,65,249,0.1)":"transparent",
                        cursor:"pointer", display:"flex", alignItems:"center", gap:8, transition:"all 0.15s" }}>
                      <span style={{ width:12, height:12, borderRadius:"50%",
                        border:`1px solid ${perPosLogos===opt.v?"#0041F9":"rgba(255,255,255,0.3)"}`,
                        display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {perPosLogos===opt.v && <span style={{ width:5, height:5, borderRadius:"50%", background:"#0041F9" }}/>}
                      </span>
                      <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.85rem",
                        fontWeight:500,
                        color: perPosLogos===opt.v?"#fff":"rgba(255,255,255,0.5)", textAlign:"left" }}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shared logo upload */}
            {!perPosLogos && (
              <div>
                <SectionLabel>Upload Your Logo</SectionLabel>
                <input ref={sharedFileRef} type="file" className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf,.svg,.ai,.eps,.dst,.pes,.exp,.dsb"
                  onChange={e => { const f=e.target.files?.[0]; if(f) handleSharedFile(f); }}/>
                <button onClick={() => sharedFileRef.current?.click()}
                  className="w-full flex items-center gap-4 text-left transition-all duration-200"
                  style={{ padding:"16px 18px", cursor:"pointer",
                    border:`1px dashed ${sharedLogo ? "rgba(0,65,249,0.5)" : "rgba(255,255,255,0.12)"}`,
                    background: sharedLogo ? "rgba(0,65,249,0.05)" : "transparent" }}>
                  <div style={{ width:32, height:32, border:"1px solid rgba(255,255,255,0.1)",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v8M4 4l3-3 3 3M1 11v.5A1.5 1.5 0 002.5 13h9a1.5 1.5 0 001.5-1.5V11"
                        stroke={sharedLogo?"#0041F9":"rgba(255,255,255,0.3)"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.88rem",
                      fontWeight:500,
                      color: sharedLogo ? "#0041F9" : "rgba(255,255,255,0.5)" }}>
                      {sharedLogo ?? "Click to upload"}
                    </p>
                    <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.75rem",
                      color:"rgba(255,255,255,0.25)", marginTop:3 }}>
                      PNG · JPG · PDF · SVG · AI · EPS · DST · PES
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* Per-position uploads are shown inside each card above when perPosLogos=true */}
            {perPosLogos && (
              <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.78rem",
                color:"rgba(255,255,255,0.38)", lineHeight:1.5 }}>
                Upload a logo file inside each selected position card above.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
