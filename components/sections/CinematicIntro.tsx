"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [visible, setVisible]   = useState(true);
  const completedRef            = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setVisible(false);   // starts the fade-out overlay
    onComplete();        // fire immediately — site loads underneath while overlay fades
  }, [onComplete]);

  /* Auto-dismiss after logo has had time to shine */
  useEffect(() => {
    const t = setTimeout(finish, 2200);
    return () => clearTimeout(t);
  }, [finish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#000000" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >

          {/* ── Noise texture — matches site grain ── */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: 0.04 }}
            aria-hidden
          >
            <filter id="intro-noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65 0.32"
                numOctaves="4"
                seed="8"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#intro-noise)" fill="white" />
          </svg>

          {/* ── Deep ambient glow — fades in first ── */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: "60vw",
              height: "50vh",
              background:
                "radial-gradient(ellipse at center, rgba(0,65,249,0.10) 0%, transparent 68%)",
              filter: "blur(48px)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 1.1, ease: "easeOut" }}
          />

          {/* ── Top thin accent line ── */}
          <motion.div
            className="absolute"
            style={{ top: "50%", left: 0, right: 0, height: 1, marginTop: -82 }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div
              style={{
                height: "100%",
                background:
                  "linear-gradient(to right, transparent 5%, rgba(0,65,249,0.45) 35%, rgba(0,65,249,0.45) 65%, transparent 95%)",
              }}
            />
          </motion.div>

          {/* ── Bottom thin accent line ── */}
          <motion.div
            className="absolute"
            style={{ top: "50%", left: 0, right: 0, height: 1, marginTop: 82 }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div
              style={{
                height: "100%",
                background:
                  "linear-gradient(to right, transparent 5%, rgba(0,65,249,0.25) 35%, rgba(0,65,249,0.25) 65%, transparent 95%)",
              }}
            />
          </motion.div>

          {/* ── Logo: clip-path reveal (scanner sweep left → right) ── */}
          <div className="relative flex items-center justify-center">

            {/* Scanning line that rides just ahead of the reveal */}
            <motion.div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                width: 2,
                background:
                  "linear-gradient(to bottom, transparent, rgba(0,65,249,0.9) 30%, rgba(80,140,255,1) 50%, rgba(0,65,249,0.9) 70%, transparent)",
                filter: "blur(1.5px)",
                zIndex: 10,
              }}
              initial={{ left: "0%", opacity: 0 }}
              animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
              transition={{
                delay: 0.35,
                duration: 0.85,
                ease: [0.76, 0, 0.24, 1],
                opacity: { times: [0, 0.05, 0.88, 1] },
              }}
            />

            {/* Logo image revealed by clip-path sweep */}
            <motion.div
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{
                delay: 0.35,
                duration: 0.85,
                ease: [0.76, 0, 0.24, 1],
              }}
            >
              <Image
                src="/logo/elevate-logo-clean.png"
                alt="Elevate Workwear Solutions"
                width={880}
                height={360}
                priority
                draggable={false}
                style={{
                  width: "min(90vw, 420px)",
                  height: "auto",
                  display: "block",
                  userSelect: "none",
                }}
              />
            </motion.div>
          </div>

          {/* ── Tagline — fades in after logo is fully revealed ── */}
          <motion.p
            style={{
              marginTop: 28,
              fontFamily: "var(--font-jetbrains,'JetBrains Mono',monospace)",
              fontSize: "0.58rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Premium B2B Workwear
          </motion.p>

          {/* ── Edge vignette ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)",
            }}
          />

          {/* ── Skip button — visible immediately ── */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            onClick={finish}
            className="absolute top-5 right-5 flex items-center gap-2 cursor-pointer"
            style={{
              fontFamily: "var(--font-jetbrains,'JetBrains Mono',monospace)",
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(8px)",
              padding: "8px 16px",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.4)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)";
            }}
          >
            Skip
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 5h6M5 2l3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
