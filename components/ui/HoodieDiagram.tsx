"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Position = "Left Chest"|"Right Chest"|"Front Centre"|"Back"|"Left Shoulder"|"Right Shoulder";
type Method   = "embroidery"|"print"|"both"|null;

const dotColor = (m: Method) => m === "print" ? "#38bdf8" : "#0041F9";

/*
  Single large view — auto-switches to Back when Back is selected.
  Images are 732×797 (front) and 728×824 (back) — pixel-tight crops.

  Dot positions as % of each image:
  Front (732×797):
    Left Chest    x=34%, y=42%   (wearer's left = viewer's left)
    Right Chest   x=66%, y=42%
    Front Centre  x=50%, y=50%
    Left Shoulder x=22%, y=27%
    Right Shoulder x=78%, y=27%

  Back (728×824):
    Back          x=50%, y=43%
*/
const FRONT_DOTS: Partial<Record<Position,{x:number;y:number}>> = {
  "Left Chest":    { x:34, y:42 },
  "Right Chest":   { x:66, y:42 },
  "Front Centre":  { x:50, y:50 },
  "Left Shoulder": { x:22, y:27 },
  "Right Shoulder":{ x:78, y:27 },
};
const BACK_DOT = { x:50, y:43 };

/* ── Animated position dot ── */
function Dot({ x, y, color }: { x:number; y:number; color:string }) {
  return (
    <motion.div
      className="absolute"
      style={{ left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)", zIndex:10, pointerEvents:"none" }}
      initial={{ scale:0, opacity:0 }}
      animate={{ scale:1, opacity:1 }}
      exit={{   scale:0, opacity:0 }}
      transition={{ type:"spring", stiffness:400, damping:22 }}
    >
      {/* Pulse ring */}
      <motion.div className="absolute rounded-full"
        style={{ width:30, height:30, top:-15, left:-15, border:`1.5px solid ${color}` }}
        animate={{ scale:[1,1.8,1], opacity:[0.5,0,0.5] }}
        transition={{ repeat:Infinity, duration:2.2, ease:"easeInOut" }}
      />
      {/* Filled dot */}
      <div style={{
        width:15, height:15, borderRadius:"50%",
        background:color,
        boxShadow:`0 0 0 3px rgba(${color==="#38bdf8"?"56,189,248":"0,65,249"},0.22), 0 0 16px ${color}`,
        position:"absolute", top:-7.5, left:-7.5,
      }}/>
      {/* White centre */}
      <div style={{
        width:5, height:5, borderRadius:"50%", background:"white", opacity:0.95,
        position:"absolute", top:-2.5, left:-2.5,
      }}/>
    </motion.div>
  );
}

export default function HoodieDiagram({ positions, method }: { positions:Position[]; method:Method }) {
  const colour     = dotColor(method);
  const hasBack    = positions.includes("Back");
  const frontPos   = positions.filter(p => p !== "Back");

  /* Auto-show back when Back is the only or last selected position */
  const [activeView, setActiveView] = useState<"front"|"back">("front");
  const currentView = hasBack && frontPos.length === 0 ? "back" : activeView;

  const imgSrc = currentView === "back"
    ? "/products/diagram-back.png"
    : "/products/diagram-front.png";

  const imgAR = currentView === "back" ? "728/824" : "732/797";

  return (
    <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:8 }}>

      {/* ── View toggle ── */}
      <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
        {(["front","back"] as const).map(v => (
          <button key={v} onClick={() => setActiveView(v)}
            style={{
              fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem",
              letterSpacing:"0.16em", textTransform:"uppercase", cursor:"pointer",
              padding:"4px 10px",
              color:       currentView === v ? "#fff" : "rgba(255,255,255,0.32)",
              border:      `1px solid ${currentView === v ? "#0041F9" : "rgba(255,255,255,0.08)"}`,
              background:  currentView === v ? "rgba(0,65,249,0.18)" : "transparent",
              transition:  "all 0.2s",
            }}>
            {v}
          </button>
        ))}
      </div>

      {/* ── Hoodie image with dots ── */}
      <div style={{
        position:     "relative",
        width:        "100%",
        aspectRatio:  imgAR,
        background:   "rgba(14,14,20,0.7)",
        border:       "1px solid rgba(255,255,255,0.06)",
        borderRadius: 4,
        overflow:     "hidden",
      }}>
        {/*
          Inner padded stage — hoodie + dots both live here.
          Padding creates the 72% coverage / equal breathing room.
          Dots are % of this inner div, so calibration stays the same.
        */}
        <div style={{
          position: "absolute",
          top: "8%", bottom: "8%", left: "10%", right: "10%",
        }}>
          {/* Hoodie image */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentView}
              src={imgSrc}
              alt={`${currentView} view`}
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              exit={{   opacity:0 }}
              transition={{ duration:0.2 }}
              style={{
                position:"absolute", top:0, left:0, right:0, bottom:0,
                width:"100%", height:"100%",
                objectFit:"contain",
                filter:"brightness(1.4) contrast(1.1)",
                userSelect:"none", pointerEvents:"none",
                WebkitUserDrag:"none",
              } as React.CSSProperties}
              draggable={false}
            />
          </AnimatePresence>

          {/* Front position dots */}
          <AnimatePresence>
            {currentView === "front" && frontPos.map(pos => {
              const d = FRONT_DOTS[pos];
              return d ? <Dot key={pos} x={d.x} y={d.y} color={colour}/> : null;
            })}
          </AnimatePresence>

          {/* Back position dot */}
          <AnimatePresence>
            {currentView === "back" && hasBack && (
              <Dot key="back" x={BACK_DOT.x} y={BACK_DOT.y} color={colour}/>
            )}
          </AnimatePresence>
        </div>

        {/* View label (stays anchored to outer container) */}
        <div style={{
          position:"absolute", bottom:8, left:0, right:0,
          display:"flex", justifyContent:"center",
          pointerEvents:"none",
        }}>
          <span style={{
            fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem",
            letterSpacing:"0.2em", textTransform:"uppercase",
            color:"rgba(255,255,255,0.2)",
          }}>
            {currentView === "back" ? "Back View" : "Front View"}
          </span>
        </div>
      </div>

      {/* Indicator dots showing which views have selections */}
      <div style={{ display:"flex", gap:4, justifyContent:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <div style={{
            width:6, height:6, borderRadius:"50%",
            background: frontPos.length > 0 ? colour : "rgba(255,255,255,0.1)",
            boxShadow: frontPos.length > 0 ? `0 0 8px ${colour}` : "none",
            transition:"all 0.3s",
          }}/>
          <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.42rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)" }}>
            Front{frontPos.length > 0 ? ` (${frontPos.length})` : ""}
          </span>
        </div>
        <span style={{ color:"rgba(255,255,255,0.15)", fontSize:"0.6rem" }}>·</span>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <div style={{
            width:6, height:6, borderRadius:"50%",
            background: hasBack ? colour : "rgba(255,255,255,0.1)",
            boxShadow: hasBack ? `0 0 8px ${colour}` : "none",
            transition:"all 0.3s",
          }}/>
          <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.42rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)" }}>
            Back{hasBack ? " (1)" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
