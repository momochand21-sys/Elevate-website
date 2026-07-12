"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── 8 frames — all gilet angles ─── */
const FRAMES = [
  "/products/gilet-360/gilet-front-final-v3.png",
  "/products/gilet-360/gilet-090.png",
  "/products/gilet-360/gilet-side-right.png",
  "/products/gilet-360/gilet-180.png",
] as const;

const N            = FRAMES.length;   // 7
const PX_PER_FRAME = 22;
const FRICTION     = 0.84;
const WHEEL_SCALE  = 0.0025;

export default function GiletViewer360() {
  /* Two image layers for smooth crossfade blending */
  const layerA        = useRef<HTMLImageElement>(null);
  const layerB        = useRef<HTMLImageElement>(null);
  const imgContainer  = useRef<HTMLDivElement>(null);   // receives 3-D lean
  const stageRef      = useRef<HTMLDivElement>(null);
  const degRef        = useRef<HTMLSpanElement>(null);

  /* Float position within [0, N) — never rounded to int */
  const posRef       = useRef(0);
  const lastLowerRef = useRef(0);   // frame index layerA is showing
  const lastUpperRef = useRef(1);   // frame index layerB is showing

  const isDragging = useRef(false);
  const lastX      = useRef(0);
  const velRef     = useRef(0);
  const rafId      = useRef(0);

  const [hint, setHint] = useState(true);

  /* ── Preload all frames up front ── */
  useEffect(() => {
    FRAMES.forEach(src => {
      const img = new window.Image();
      img.src = src;
    });
    /* Init both layers */
    if (layerA.current) { layerA.current.src = FRAMES[0]; layerA.current.style.opacity = "1"; }
    if (layerB.current) { layerB.current.src = FRAMES[1]; layerB.current.style.opacity = "0"; }
  }, []);

  /* ── Core renderer ────────────────────────────────────────────────────
     Two techniques to minimise afterimage / ghosting:

     1. SMOOTHERSTEP CURVE  (6t⁵ - 15t⁴ + 10t³)
        Steeper than linear — spends very little time near 50/50 opacity.
        At t=0.25 → blend=0.10 (90% frame A visible, barely any B)
        At t=0.50 → blend=0.50 (unavoidable midpoint)
        At t=0.75 → blend=0.90 (mostly frame B, barely any A)
        Compare linear: t=0.25 → blend=0.25 → 25% afterimage.

     2. PERSPECTIVE 3-D LEAN
        As the blend progresses, the image container tilts slightly in 3-D.
        sin(t·π) peaks at midpoint (max lean when most ghosting would occur).
        The brain reads the tilt as physical rotation, not a cross-dissolve —
        effectively masking the residual afterimage.
  ─────────────────────────────────────────────────────────────────────── */
  const renderPos = useCallback((pos: number) => {
    const p = ((pos % N) + N) % N;
    posRef.current = p;

    const lower = Math.floor(p);
    const upper = (lower + 1) % N;
    const t     = p - lower;                          // raw [0, 1]

    // Smootherstep: 6t⁵ - 15t⁴ + 10t³
    const blend = t * t * t * (t * (t * 6 - 15) + 10);

    // 3-D lean: peaks at midpoint, direction follows drag
    const leanDir = velRef.current >= 0 ? 1 : -1;
    const leanDeg = Math.sin(t * Math.PI) * 5 * leanDir;

    // Swap src only when frame index changes
    if (lower !== lastLowerRef.current) {
      lastLowerRef.current = lower;
      if (layerA.current) {
        layerA.current.src = FRAMES[lower];
        // Debug log — remove after confirming 0° frame loads correctly
        console.log(`[GiletViewer] angle=${lower * (360/N)}°  src=${FRAMES[lower]}  `+
          `natural=${layerA.current.naturalWidth}×${layerA.current.naturalHeight}  `+
          `rendered=${layerA.current.offsetWidth}×${layerA.current.offsetHeight}`);
      }
    }
    if (upper !== lastUpperRef.current) {
      lastUpperRef.current = upper;
      if (layerB.current) layerB.current.src = FRAMES[upper];
    }

    // Opacity blend
    if (layerA.current) layerA.current.style.opacity = String(1 - blend);
    if (layerB.current) layerB.current.style.opacity  = String(blend);

    // Perspective lean (applied to both images as one unit)
    if (imgContainer.current) {
      imgContainer.current.style.transform =
        `perspective(1400px) rotateY(${leanDeg}deg)`;
    }

    if (degRef.current) {
      degRef.current.textContent = `${Math.round(p * (360 / N))}°`;
    }
  }, []);

  const advance = useCallback((delta: number) => {
    renderPos(posRef.current + delta);
  }, [renderPos]);

  const inertia = useCallback(() => {
    velRef.current *= FRICTION;
    if (Math.abs(velRef.current) < 0.003) { velRef.current = 0; return; }
    advance(velRef.current);
    rafId.current = requestAnimationFrame(inertia);
  }, [advance]);

  /* ── Pointer events ── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    cancelAnimationFrame(rafId.current);
    isDragging.current = true;
    lastX.current  = e.clientX;
    velRef.current = 0;
    setHint(false);
    if (stageRef.current) stageRef.current.style.cursor = "grabbing";
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const dx = e.clientX - lastX.current;
    lastX.current   = e.clientX;
    velRef.current  = dx / PX_PER_FRAME;
    advance(dx / PX_PER_FRAME);
  }, [advance]);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (stageRef.current) stageRef.current.style.cursor = "grab";
    rafId.current = requestAnimationFrame(inertia);
  }, [inertia]);

  /* ── Mouse wheel ── */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cancelAnimationFrame(rafId.current);
      advance(e.deltaY * WHEEL_SCALE);
      rafId.current = requestAnimationFrame(inertia);
    };
    const blockSel = (e: Event) => e.preventDefault();
    el.addEventListener("wheel",       onWheel,   { passive: false });
    el.addEventListener("selectstart", blockSel);
    return () => {
      el.removeEventListener("wheel",       onWheel);
      el.removeEventListener("selectstart", blockSel);
      cancelAnimationFrame(rafId.current);
    };
  }, [advance, inertia]);

  /* ── Shared image style ── */
  const imgStyle = {
    position:       "absolute" as const,
    top: 0, left: 0, right: 0, bottom: 0,
    width:          "100%",
    height:         "100%",
    objectFit:      "contain" as const,
    objectPosition: "center",
    userSelect:     "none" as const,
    pointerEvents:  "none" as const,
  };

  return (
    <div
      className="relative w-full h-full select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {/* ── Interactive stage ── */}
      <div
        ref={stageRef}
        className="absolute inset-0"
        style={{ cursor: "grab", touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
        onDragStart={e => e.preventDefault()}
      >
        {/* Image layers — NO filter, NO shadow, NO glow, NO gradient */}
        <div
          ref={imgContainer}
          className="absolute"
          style={{
            top: "2%", left: "2%", right: "2%", bottom: "2%",
            transformOrigin: "center center",
            filter: "none",
            boxShadow: "none",
            background: "transparent",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={layerA}
            src={FRAMES[0]}
            alt=""
            draggable={false}
            onDragStart={e => e.preventDefault()}
            onError={e => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
            style={{ ...imgStyle, opacity: 1 }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={layerB}
            src={FRAMES[1]}
            alt=""
            draggable={false}
            onDragStart={e => e.preventDefault()}
            onError={e => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
            style={{ ...imgStyle, opacity: 0 }}
          />
        </div>
      </div>

      {/* Degree counter */}
      <span
        ref={degRef}
        className="absolute bottom-3 left-4 pointer-events-none select-none"
        style={{
          fontFamily: "var(--font-bebas,'Bebas Neue')",
          fontSize: "1.6rem",
          letterSpacing: "0.04em",
          color: "rgba(255,255,255,0.07)",
          lineHeight: 1,
        }}
      >0°</span>

      {/* Drag hint */}
      <AnimatePresence>
        {hint && (
          <motion.div
            className="absolute bottom-3 right-4 flex items-center gap-2 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <motion.span
              style={{ color: "rgba(255,255,255,0.26)", fontSize: "0.85rem" }}
              animate={{ x: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >←</motion.span>
            <span style={{
              fontFamily: "var(--font-jetbrains,monospace)",
              fontSize: "0.5rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.18)",
            }}>Drag to rotate</span>
            <motion.span
              style={{ color: "rgba(255,255,255,0.26)", fontSize: "0.85rem" }}
              animate={{ x: [4, -4, 4] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >→</motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
