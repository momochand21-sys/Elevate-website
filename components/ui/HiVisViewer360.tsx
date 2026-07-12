"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── 4 frames — front / right / back / left ─── */
const FRAMES = [
  "/products/hi-vis-360/hi-vis-000.png",
  "/products/hi-vis-360/hi-vis-090.png",
  "/products/hi-vis-360/hi-vis-180.png",
  "/products/hi-vis-360/hi-vis-270.png",
] as const;

const N            = FRAMES.length;
const PX_PER_FRAME = 40;
const FRICTION     = 0.84;
const WHEEL_SCALE  = 0.002;

export default function HiVisViewer360() {
  const layerA        = useRef<HTMLImageElement>(null);
  const layerB        = useRef<HTMLImageElement>(null);
  const imgContainer  = useRef<HTMLDivElement>(null);
  const stageRef      = useRef<HTMLDivElement>(null);

  const posRef       = useRef(0);
  const lastLowerRef = useRef(0);
  const lastUpperRef = useRef(1);

  const isDragging = useRef(false);
  const lastX      = useRef(0);
  const velRef     = useRef(0);
  const rafId      = useRef(0);

  const [hint, setHint] = useState(true);

  useEffect(() => {
    FRAMES.forEach(src => { const img = new window.Image(); img.src = src; });
    if (layerA.current) { layerA.current.src = FRAMES[0]; layerA.current.style.opacity = "1"; }
    if (layerB.current) { layerB.current.src = FRAMES[1]; layerB.current.style.opacity = "0"; }
  }, []);

  const renderPos = useCallback((pos: number) => {
    const p = ((pos % N) + N) % N;
    posRef.current = p;

    const lower = Math.floor(p);
    const upper = (lower + 1) % N;
    const t     = p - lower;
    const blend = t * t * t * (t * (t * 6 - 15) + 10);   // smootherstep

    const leanDir = velRef.current >= 0 ? 1 : -1;
    const leanDeg = Math.sin(t * Math.PI) * 5 * leanDir;

    if (lower !== lastLowerRef.current) {
      lastLowerRef.current = lower;
      if (layerA.current) layerA.current.src = FRAMES[lower];
    }
    if (upper !== lastUpperRef.current) {
      lastUpperRef.current = upper;
      if (layerB.current) layerB.current.src = FRAMES[upper];
    }

    if (layerA.current) layerA.current.style.opacity = String(1 - blend);
    if (layerB.current) layerB.current.style.opacity  = String(blend);

    if (imgContainer.current) {
      imgContainer.current.style.transform = `perspective(1400px) rotateY(${leanDeg}deg)`;
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
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("selectstart", blockSel);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("selectstart", blockSel);
      cancelAnimationFrame(rafId.current);
    };
  }, [advance, inertia]);

  const imgStyle = {
    position: "absolute" as const,
    top: 0, left: 0, right: 0, bottom: 0,
    width: "100%", height: "100%",
    objectFit: "contain" as const,
    objectPosition: "center",
    userSelect: "none" as const,
    pointerEvents: "none" as const,
  };

  return (
    <div className="relative w-full h-full select-none" style={{ userSelect: "none", WebkitUserSelect: "none" }}>
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
        <div
          ref={imgContainer}
          className="absolute"
          style={{ top: "2%", left: "2%", right: "2%", bottom: "2%", transformOrigin: "center center" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={layerA} src={FRAMES[0]} alt="" draggable={false}
            onDragStart={e => e.preventDefault()}
            onError={e => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
            style={{ ...imgStyle, opacity: 1 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={layerB} src={FRAMES[1]} alt="" draggable={false}
            onDragStart={e => e.preventDefault()}
            onError={e => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
            style={{ ...imgStyle, opacity: 0 }} />
        </div>
      </div>

      <AnimatePresence>
        {hint && (
          <motion.div
            className="absolute bottom-3 right-4 flex items-center gap-2 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <motion.span style={{ color: "rgba(255,255,255,0.26)", fontSize: "0.85rem" }}
              animate={{ x: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>←</motion.span>
            <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>Drag to rotate</span>
            <motion.span style={{ color: "rgba(255,255,255,0.26)", fontSize: "0.85rem" }}
              animate={{ x: [4, -4, 4] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>→</motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
