"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────
   12 FRAMES  ·  0° → 330°  ·  30° steps
   More frames = finer rotation steps = smoother turntable feel.
   All transparent PNGs, 1400px wide.
───────────────────────────────────────────────────────────────── */
const FRAMES = [
  "/products/360/hoodie-000.png",   // 0°   Front
  "/products/360/hoodie-030.png",   // 30°  Front-Right
  "/products/360/hoodie-060.png",   // 60°  Front-Right
  "/products/360/hoodie-090.png",   // 90°  Right Side
  "/products/360/hoodie-120.png",   // 120° Rear-Right
  "/products/360/hoodie-150.png",   // 150° Rear-Right
  "/products/360/hoodie-180.png",   // 180° Back
  "/products/360/hoodie-210.png",   // 210° Rear-Left
  "/products/360/hoodie-240.png",   // 240° Rear-Left
  "/products/360/hoodie-270.png",   // 270° Left Side
  "/products/360/hoodie-300.png",   // 300° Front-Left
  "/products/360/hoodie-315.png",   // 315° Front-Left
] as const;

const N             = FRAMES.length;   // 12
const DEG_PER_FRAME = 30;             // degrees each frame covers
const PX_PER_FRAME  = 22;            // px of drag per frame (responsive feel)
const FRICTION      = 0.84;           // inertia decay
const WHEEL_SCALE   = 0.008;          // wheel → frame units

const frameDeg = (i: number) => (((i % N) + N) % N) * DEG_PER_FRAME;

/* ─────────────────────────────────────────────────────────────────
   PER-FEATURE ANNOTATIONS
   x / y = position of the glowing dot as % of the stage container.
   Each annotation points directly at the feature on the hoodie.
───────────────────────────────────────────────────────────────── */
interface Ann { text: string; x: number; y: number; dir: "left" | "right" }

type Zone = "front" | "right" | "back" | "left" | null;

function getZone(deg: number): Zone {
  const d = ((deg % 360) + 360) % 360;
  if (d <= 20 || d >= 340)         return "front";
  if (d >= 70  && d <= 110)        return "right";
  if (d >= 160 && d <= 200)        return "back";
  if (d >= 250 && d <= 290)        return "left";
  return null;
}

/* Dot positions calibrated to the 1400×940 transparent-PNG hoodie renders.
   Container AR matches image AR (≈1.49:1) so % coordinates map 1:1. */
const ZONE_ANNS: Record<NonNullable<Zone>, Ann[]> = {
  front: [
    { text: "Drawstring Hood",           x: 50,  y: 20,  dir: "left"  },
    { text: "Embroidered Chest Logo",    x: 62,  y: 44,  dir: "right" },
    { text: "400gsm Heavyweight Fleece", x: 33,  y: 54,  dir: "left"  },
    { text: "Kangaroo Pocket",           x: 55,  y: 67,  dir: "right" },
  ],
  right: [
    { text: "Reinforced Side Seams",     x: 53,  y: 46,  dir: "right" },
    { text: "Ribbed Cuffs & Hem",        x: 75,  y: 83,  dir: "right" },
  ],
  back: [
    { text: "Large Back Branding",       x: 59,  y: 40,  dir: "right" },
    { text: "Durable Commercial Fabric", x: 40,  y: 60,  dir: "left"  },
  ],
  left: [
    { text: "Reinforced Stitching",      x: 48,  y: 46,  dir: "left"  },
    { text: "Ribbed Cuffs & Hem",        x: 25,  y: 83,  dir: "left"  },
  ],
};

/* ─────────────────────────────────────────────────────────────────
   CALLOUT — glowing dot + connecting line + frosted label
   Positioned absolutely within the product stage so the dot sits
   exactly on the hoodie feature it describes.
───────────────────────────────────────────────────────────────── */
function Callout({ text, x, y, dir }: Ann) {
  const isRight = dir === "right";
  return (
    <motion.div
      className="absolute pointer-events-none hidden md:block"
      style={{ left: `${x}%`, top: `${y}%`, zIndex: 20 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {/* ── Glowing dot — sits directly on the hoodie feature ── */}
      <div style={{
        position: "absolute",
        width: 7, height: 7,
        borderRadius: "50%",
        background: "#0041F9",
        boxShadow: "0 0 0 2px rgba(0,65,249,0.28), 0 0 10px rgba(0,65,249,0.9)",
        transform: "translate(-50%, -50%)",
        zIndex: 2,
      }}/>

      {/* ── Connecting arm: line → label ── */}
      <div style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        ...(isRight ? { left: 5 } : { right: 5 }),
        display: "flex",
        flexDirection: isRight ? "row" : "row-reverse",
        alignItems: "center",
      }}>
        {/* Thin connecting line (fades toward label) */}
        <div style={{
          width: 42,
          height: 1,
          flexShrink: 0,
          background: isRight
            ? "linear-gradient(to right, rgba(0,65,249,0.95), rgba(0,65,249,0.3))"
            : "linear-gradient(to left,  rgba(0,65,249,0.95), rgba(0,65,249,0.3))",
        }}/>

        {/* Frosted label pill */}
        <div style={{
          padding: "3px 8px",
          background: "rgba(5,5,9,0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(0,65,249,0.32)",
          ...(isRight
            ? { borderLeft: "none", borderRadius: "0 3px 3px 0" }
            : { borderRight: "none", borderRadius: "3px 0 0 3px" }),
        }}>
          <span style={{
            display: "block",
            fontFamily: "var(--font-jetbrains,'JetBrains Mono',monospace)",
            fontSize: "0.54rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(208,216,240,0.9)",
            whiteSpace: "nowrap",
          }}>
            {text}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
export default function ProductShowcase() {
  /* Image layers — ping-pong crossfade */
  const layerA      = useRef<HTMLImageElement>(null);
  const layerB      = useRef<HTMLImageElement>(null);
  const activeIsA   = useRef(true);   // which layer is currently on top

  /* DOM refs (no re-render needed) */
  const stageRef    = useRef<HTMLDivElement>(null);
  const degRef      = useRef<HTMLSpanElement>(null);
  const barRef      = useRef<HTMLDivElement>(null);

  /* Turntable state */
  const posRef      = useRef(0);
  const lastIdx     = useRef(-1);
  const isDragging  = useRef(false);
  const lastX       = useRef(0);
  const velRef      = useRef(0);
  const rafId       = useRef(0);
  const zoneRef     = useRef<Zone>(null);

  /* React state — fires only on load + zone boundary */
  const [loaded, setLoaded] = useState(false);
  const [zone,   setZone]   = useState<Zone>(null);
  const [hint,   setHint]   = useState(true);

  /* ── 1. Preload all 12 frames ── */
  useEffect(() => {
    let done = 0;
    FRAMES.forEach(src => {
      const img = new window.Image();
      img.onload = img.onerror = () => { if (++done === N) setLoaded(true); };
      img.src = src;
    });
  }, []);

  /* ── 2. Toggle transition speed: instant during drag, smooth on settle ── */
  const setTransitionSpeed = useCallback((fast: boolean) => {
    const t = fast ? "none" : "opacity 90ms ease";
    if (layerA.current) layerA.current.style.transition = t;
    if (layerB.current) layerB.current.style.transition = t;
  }, []);

  /* ── 3. Ping-pong crossfade frame commit ── */
  const commitFrame = useCallback((pos: number) => {
    const idx = Math.round(((pos % N) + N) % N);
    if (idx === lastIdx.current) return;
    lastIdx.current = idx;

    const src = FRAMES[idx];

    /* Swap layers: the "incoming" layer gets the new src and fades to 1,
       the "outgoing" layer fades to 0 */
    if (activeIsA.current) {
      if (layerB.current) { layerB.current.src = src; layerB.current.style.opacity = "1"; }
      if (layerA.current)   layerA.current.style.opacity = "0";
    } else {
      if (layerA.current) { layerA.current.src = src; layerA.current.style.opacity = "1"; }
      if (layerB.current)   layerB.current.style.opacity = "0";
    }
    activeIsA.current = !activeIsA.current;

    /* Degree counter + progress bar (direct DOM) */
    const deg = frameDeg(idx);
    if (degRef.current)  degRef.current.textContent = `${deg}°`;
    if (barRef.current)  barRef.current.style.transform = `scaleX(${deg / 360})`;

    /* Zone update — only triggers React re-render at zone boundaries */
    const z = getZone(deg);
    if (z !== zoneRef.current) { zoneRef.current = z; setZone(z); }
  }, []);

  /* ── 4. Advance position + commit ── */
  const advance = useCallback((delta: number) => {
    posRef.current = ((posRef.current + delta) % N + N) % N;
    commitFrame(posRef.current);
  }, [commitFrame]);

  /* ── 5. Inertia loop ── */
  const inertia = useCallback(() => {
    velRef.current *= FRICTION;
    if (Math.abs(velRef.current) < 0.004) { velRef.current = 0; return; }
    advance(velRef.current);
    rafId.current = requestAnimationFrame(inertia);
  }, [advance]);

  /* ── 6. Pointer events (mouse + touch) ── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();          // block browser drag / text-selection start
    if (!loaded) return;
    cancelAnimationFrame(rafId.current);
    isDragging.current = true;
    lastX.current      = e.clientX;
    velRef.current     = 0;
    setTransitionSpeed(true);
    setHint(false);
    /* Switch to "grabbing" cursor immediately */
    if (stageRef.current) stageRef.current.style.cursor = "grabbing";
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [loaded, setTransitionSpeed]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();          // block text-selection during move
    const dx = e.clientX - lastX.current;
    lastX.current  = e.clientX;
    velRef.current = dx / PX_PER_FRAME;
    advance(dx / PX_PER_FRAME);
  }, [advance]);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setTransitionSpeed(false);
    /* Restore grab cursor */
    if (stageRef.current) stageRef.current.style.cursor = "grab";
    rafId.current = requestAnimationFrame(inertia);
  }, [inertia, setTransitionSpeed]);

  /* ── 7. Mouse wheel (non-passive — prevents page scroll) ── */
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !loaded) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cancelAnimationFrame(rafId.current);
      const delta = e.deltaY * WHEEL_SCALE;
      velRef.current = delta;
      advance(delta);
      setTransitionSpeed(false);
      rafId.current = requestAnimationFrame(inertia);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [loaded, advance, inertia, setTransitionSpeed]);

  /* ── 8. Initialise first frame on load ── */
  useEffect(() => {
    if (!loaded) return;
    if (layerA.current) { layerA.current.src = FRAMES[0]; layerA.current.style.opacity = "1"; }
    if (layerB.current)   layerB.current.style.opacity = "0";
  }, [loaded]);

  /* ── 9. Block selectstart on the stage (kills blue selection box) ── */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const block = (e: Event) => e.preventDefault();
    el.addEventListener("selectstart", block);
    return () => el.removeEventListener("selectstart", block);
  }, []);

  /* ── 10. Cleanup RAF ── */
  useEffect(() => () => cancelAnimationFrame(rafId.current), []);

  const annotations = zone ? ZONE_ANNS[zone] : null;

  /* ───────────────────────────────────────────────────────────── */
  return (
    <section
      id="products"
      className="relative w-full overflow-hidden select-none"
      style={{ height: "100vh", userSelect: "none", WebkitUserSelect: "none" }}
    >

      {/* ── Loading overlay ── */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-5"
            style={{ background: "#07070A" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-48 h-[1px] overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
              <motion.div className="h-full bg-blue origin-left"
                animate={{ scaleX: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}/>
            </div>
            <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.58rem",
              letterSpacing:"0.24em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>
              Loading 360° Viewer
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          ENVIRONMENT
      ══════════════════════════════════════ */}
      <div className="absolute inset-0" style={{ background: "#07070A" }}/>

      <svg className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ opacity: 0.038 }} aria-hidden>
        <filter id="tt-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65 0.32"
            numOctaves="4" seed="15" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#tt-noise)" fill="white"/>
      </svg>

      {/* Back-wall hot spot */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 38% 52% at 50% 42%, rgba(28,28,46,1) 0%, rgba(5,5,8,1) 58%)",
      }}/>

      {/* Spotlight cone */}
      <div className="absolute pointer-events-none" style={{
        top: 0, left: "50%", transform: "translateX(-50%)",
        width: "18%", height: "80%",
        background: "linear-gradient(to bottom, rgba(255,255,255,0.068) 0%, transparent 86%)",
        clipPath: "polygon(16% 0%, 84% 0%, 90% 100%, 10% 100%)",
      }}/>

      {/* Floor */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "36%" }}>
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, rgba(3,3,6,0.95) 0%, transparent 100%)",
        }}/>
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }} aria-hidden>
          {[10,25,40,60,75,90].map(x => (
            <line key={x} x1={`${x}%`} y1="100%" x2="50%" y2="0" stroke="white" strokeWidth="0.5"/>
          ))}
          <line x1="0" y1="38%" x2="100%" y2="38%" stroke="white" strokeWidth="0.3" strokeDasharray="3 10"/>
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="white" strokeWidth="0.25" strokeDasharray="2 10"/>
        </svg>
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 24% 58% at 0% 50%, rgba(0,30,110,0.055) 0%, transparent 55%)",
      }}/>
      <div className="grain absolute inset-0 opacity-[0.016] pointer-events-none"/>
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: "radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,0.58) 100%)",
      }}/>

      {/* ══════════════════════════════════════
          UI OVERLAYS
      ══════════════════════════════════════ */}

      {/* Title */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-end justify-between px-6 md:px-12 pt-[82px]">
        <div>
          <p className="section-label mb-1.5">360° Product View</p>
          <h2 className="text-off-white" style={{
            fontFamily:"var(--font-bebas,'Bebas Neue')",
            fontSize:"clamp(1.8rem,4vw,3.4rem)",
            letterSpacing:"0.05em", lineHeight:1,
          }}>
            Heavyweight Workwear Hoodie
          </h2>
        </div>
        <p className="hidden sm:block text-right" style={{
          fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.6rem",
          letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.22)",
        }}>
          ELV-001 &nbsp;·&nbsp; 400gsm
        </p>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 md:px-12 pb-5">
        <span ref={degRef} style={{
          fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"2.6rem",
          letterSpacing:"0.04em", color:"rgba(255,255,255,0.07)",
          lineHeight:1, userSelect:"none",
        }}>0°</span>

        {/* Drag hint */}
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {hint && loaded && (
              <motion.div className="flex items-center gap-2.5"
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                transition={{ delay:0.8, duration:0.5 }}>
                <motion.span style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.9rem" }}
                  animate={{ x:[-5,5,-5] }}
                  transition={{ repeat:Infinity, duration:1.5, ease:"easeInOut" }}>←</motion.span>
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.58rem",
                  letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)" }}>
                  Drag to Rotate
                </p>
                <motion.span style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.9rem" }}
                  animate={{ x:[5,-5,5] }}
                  transition={{ repeat:Infinity, duration:1.5, ease:"easeInOut" }}>→</motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Frame dots */}
        <div className="flex gap-1 flex-wrap justify-end" style={{ maxWidth:160 }}>
          {FRAMES.map((_, i) => (
            <div key={i} style={{
              width:3, height:2, borderRadius:"999px",
              background:"rgba(255,255,255,0.09)",
            }}/>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          PRODUCT STAGE
          Sized to match image AR (≈1.49:1) so object-contain fills
          the frame and % coordinates map directly to hoodie pixels.
      ══════════════════════════════════════ */}
      <div
        ref={stageRef}
        className="absolute z-20 select-none"
        style={{
          top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          width:  "min(90vw, 980px)",
          height: "min(60.4vw, 660px)",
          cursor: loaded ? "grab" : "default",
          /* All vendor-prefix user-select — kills blue highlight box */
          userSelect:          "none",
          WebkitUserSelect:    "none",
          touchAction:         "none",   // prevents scroll hijack on mobile
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
        /* Block browser native drag + text selection events */
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Rim halo */}
        <div aria-hidden className="absolute pointer-events-none" style={{
          inset:"-16% -20%",
          background:[
            "radial-gradient(ellipse 62% 55% at 50% 30%, rgba(18,24,72,0.48) 0%, transparent 58%)",
            "radial-gradient(ellipse 36% 60% at 20% 55%, rgba(0,25,90,0.07) 0%, transparent 50%)",
          ].join(","),
          filter:"blur(22px)", zIndex:0,
        }}/>

        {/* Contact shadow */}
        <div aria-hidden className="absolute pointer-events-none" style={{
          bottom:"-6%", left:"50%", transform:"translateX(-50%)",
          width:"78%", height:"10%",
          background:"radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, transparent 70%)",
          borderRadius:"50%", filter:"blur(44px)", opacity:0.24, zIndex:1,
        }}/>
        <div aria-hidden className="absolute pointer-events-none" style={{
          bottom:"-11%", left:"50%", transform:"translateX(-50%)",
          width:"96%", height:"12%",
          background:"radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, transparent 68%)",
          borderRadius:"50%", filter:"blur(62px)", opacity:0.19, zIndex:1,
        }}/>

        {/* ── PING-PONG IMAGE LAYERS ──
            Two stacked imgs. The incoming one fades to 1,
            outgoing fades to 0. Transition: none during drag,
            90ms ease on settle for silky crossfade.             */}
        <div className="absolute inset-0" style={{
          zIndex:3,
          filter:[
            "drop-shadow(0 52px 68px rgba(0,0,0,0.95))",
            "drop-shadow(0 18px 32px rgba(0,0,0,0.55))",
            "drop-shadow(0 -1px 24px rgba(0,18,72,0.07))",
          ].join(" "),
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={layerA}
            src={FRAMES[0]}
            alt="Hoodie layer A"
            className="absolute inset-0 w-full h-full object-contain select-none"
            style={{
              opacity: 1,
              userSelect: "none",
              WebkitUserSelect: "none",
              pointerEvents: "none",
              /* Kill ghost image on native drag */
              WebkitUserDrag: "none",
            } as React.CSSProperties}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}/>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={layerB}
            src={FRAMES[0]}
            alt="Hoodie layer B"
            className="absolute inset-0 w-full h-full object-contain select-none"
            style={{
              opacity: 0,
              userSelect: "none",
              WebkitUserSelect: "none",
              pointerEvents: "none",
              WebkitUserDrag: "none",
            } as React.CSSProperties}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}/>
        </div>

        {/* ── PER-FEATURE ANNOTATIONS ──
            Positioned within the stage so dots sit on hoodie features. */}
        <AnimatePresence mode="wait">
          {annotations && (
            <motion.div key={zone} className="absolute inset-0" style={{ zIndex:10 }}>
              {annotations.map(ann => (
                <Callout key={ann.text} {...ann}/>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shoulder highlight */}
        <div aria-hidden className="absolute pointer-events-none" style={{
          top:"-2%", left:"50%", transform:"translateX(-50%)",
          width:"84%", height:"40%",
          background:"radial-gradient(ellipse 68% 55% at 50% 0%, rgba(255,255,255,0.022) 0%, transparent 62%)",
          zIndex:4,
        }}/>
      </div>

      {/* Progress line */}
      <div className="absolute bottom-0 left-0 right-0 z-40"
        style={{ height:1, background:"rgba(255,255,255,0.04)" }}>
        <div ref={barRef} className="h-full origin-left"
          style={{ background:"#0041F9", opacity:0.65,
            transform:"scaleX(0)", willChange:"transform" }}/>
      </div>
    </section>
  );
}
