"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";
import ElevateLogo from "@/components/ui/ElevateLogo";
import { useQuoteModal } from "@/lib/quote-modal-context";

interface HeroProps {
  introComplete?: boolean;
}

export default function Hero({ introComplete = false }: HeroProps) {
  const { open: openQuote } = useQuoteModal();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [barsGone, setBarsGone] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const subtitleY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);

  useEffect(() => {
    if (!introComplete) return; // wait for cinematic intro to finish
    const t1 = setTimeout(() => setLoaded(true), 100);
    const t2 = setTimeout(() => setBarsGone(true), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [introComplete]);

  const handleScroll = () => {
    const next = document.querySelector("#about");
    if (next) next.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative w-full h-screen min-h-[640px] overflow-hidden bg-black flex items-center justify-center"
    >
      {/* ── Animated gradient background ── */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        {/* Primary blue orb — large, centered-left */}
        <motion.div
          className="absolute top-[20%] left-[15%] w-[500px] h-[500px] orb orb-blue"
          animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
        />
        {/* Secondary blue orb — smaller, right */}
        <motion.div
          className="absolute top-[50%] right-[10%] w-[320px] h-[320px] orb orb-blue-sm"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity, delay: 2 }}
        />
        {/* Faint gold orb — bottom */}
        <motion.div
          className="absolute bottom-[5%] left-[40%] w-[280px] h-[180px]"
          style={{ background: "radial-gradient(ellipse, rgba(198,170,114,0.06) 0%, transparent 70%)", filter: "blur(80px)" }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 11, ease: "easeInOut", repeat: Infinity, delay: 1 }}
        />
      </motion.div>

      {/* ── Vignette ── */}
      <div className="vignette absolute inset-0 z-[2]" />

      {/* ── Scanlines ── */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.04) 2px,rgba(255,255,255,0.04) 4px)",
        }}
      />

      {/* ── Cinematic letterbox bars ── */}
      <AnimatePresence>
        {!barsGone && (
          <>
            <motion.div
              className="absolute top-0 left-0 right-0 z-[20] bg-black"
              initial={{ height: 80 }}
              animate={{ height: 80 }}
              exit={{ height: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-[20] bg-black"
              initial={{ height: 80 }}
              animate={{ height: 80 }}
              exit={{ height: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── Corner metadata ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ delay: 2.8, duration: 1 }}
        className="absolute top-24 left-6 md:left-12 z-10 flex flex-col gap-1"
      >
        <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-blue">Premium B2B</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ delay: 2.8, duration: 1 }}
        className="absolute top-24 right-6 md:right-12 z-10 text-right"
      >
        <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-muted">WORKWEAR SOLUTIONS</span>
      </motion.div>

      {/* ── Main hero content ── */}
      <motion.div
        className="relative z-[10] flex flex-col items-center text-center px-6"
        style={{ y: titleY, opacity }}
      >
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 16 }}
          transition={{ delay: 1.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="section-label mb-8"
        >
          Premium Workwear
        </motion.div>

        {/* Logo reveal */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 32, scale: loaded ? 1 : 0.97 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: loaded ? "drop-shadow(0 0 60px rgba(0,65,249,0.18))" : "none" }}
        >
          <ElevateLogo variant="hero" />
        </motion.div>

        {/* Blue accent line */}
        <motion.div
          className="my-6 h-[1px] bg-blue origin-left"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: loaded ? 1 : 0, opacity: loaded ? 1 : 0 }}
          transition={{ delay: 1.5, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "clamp(60px, 8vw, 120px)" }}
        />

        {/* Subtitle */}
        <motion.p
          style={{
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono')",
            fontSize: "clamp(9px, 1.1vw, 12px)",
            letterSpacing: "0.3em",
            y: subtitleY,
          }}
          className="font-mono uppercase text-silver mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 12 }}
          transition={{ delay: 1.9, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          Workwear Solutions — Built for the Elite
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
          transition={{ delay: 2.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <MagneticButton
            className="group relative overflow-hidden bg-blue text-white font-mono text-[11px] tracking-[0.14em] uppercase px-8 py-4 flex items-center gap-2.5"
            strength={28}
            onClick={openQuote}
          >
            <span className="relative z-10">Get Your Quote</span>
            <svg
              className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path d="M2 7H12M7 2L12 7L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* Shimmer overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s ease-in-out infinite" }}
            />
          </MagneticButton>

          <MagneticButton
            className="font-mono text-[11px] tracking-[0.14em] uppercase text-silver border border-white/10 hover:border-blue/40 hover:text-off-white px-8 py-4 transition-all duration-400 flex items-center gap-2.5"
            strength={20}
            onClick={() => router.push("/our-work")}
          >
            <span>View Our Work</span>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ delay: 3.0, duration: 1 }}
        onClick={handleScroll}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 cursor-pointer group"
      >
        <span className="font-mono text-[8px] tracking-[0.24em] uppercase text-muted group-hover:text-blue transition-colors duration-300">
          Scroll
        </span>
        <div className="relative w-[1px] h-10 bg-border overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full bg-blue"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.2 }}
            style={{ height: "50%" }}
          />
        </div>
      </motion.div>

      {/* ── Bottom stats bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
        transition={{ delay: 2.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-8 left-6 md:left-12 right-6 md:right-12 z-10 hidden md:flex items-end justify-between"
      >
        {[
          { value: "5+", label: "Products Available" },
          { value: "<5hrs", label: "Quote Response" },
          { value: "100%", label: "Quality Guaranteed" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5">
            <span
              className="text-off-white"
              style={{
                fontFamily: "var(--font-bebas, 'Bebas Neue')",
                fontSize: "clamp(1.6rem, 3vw, 2.8rem)",
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              {stat.value}
            </span>
            <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-muted">
              {stat.label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue animate-pulse" />
          <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-muted">
            Accepting Orders
          </span>
        </div>
      </motion.div>
    </section>
  );
}
