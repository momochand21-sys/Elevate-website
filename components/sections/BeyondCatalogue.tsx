"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useQuoteModal } from "@/lib/quote-modal-context";

/* ─────────────────────────────────────────────────────────────
   BEYOND THE CATALOGUE
   Makes it unmistakable that the on-site range is only a
   selection — Elevate sources and brands virtually any workwear
   a client needs (hi-vis, aprons, PPE, bespoke, anything).
   Reused on the homepage and at the foot of the products page.
   ───────────────────────────────────────────────────────────── */

const CAPABILITIES: { label: string; highlight?: boolean }[] = [
  { label: "Hi-Vis Vests & Jackets" },
  { label: "Aprons & Tabards" },
  { label: "Workwear Trousers" },
  { label: "Softshell Jackets" },
  { label: "Bodywarmers & Gilets" },
  { label: "T-Shirts & Sweatshirts" },
  { label: "Fleeces & Waterproofs" },
  { label: "Caps, Beanies & Headwear" },
  { label: "Chef & Hospitality Wear" },
  { label: "PPE & Safety Workwear" },
  { label: "Bags & Accessories" },
  { label: "+ Anything Bespoke", highlight: true },
];

export default function BeyondCatalogue() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  const { open: openQuote } = useQuoteModal();

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden py-28 md:py-40"
      style={{ background: "#060608" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 50% 35%, rgba(0,65,249,0.06) 0%, transparent 70%)",
        }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.022,
          backgroundImage:
            "linear-gradient(rgba(0,65,249,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,65,249,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Top / bottom hairlines */}
      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: "rgba(255,255,255,0.05)" }} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <p className="section-label mb-5">More Than A Catalogue</p>

          <h2
            className="text-off-white mb-6"
            style={{
              fontFamily: "var(--font-bebas,'Bebas Neue')",
              fontSize: "clamp(2.6rem,6vw,5rem)",
              letterSpacing: "0.03em",
              lineHeight: 0.92,
            }}
          >
            What You See Here<br />
            <span className="text-gradient-blue">Is Just The Start.</span>
          </h2>

          <p
            style={{
              fontFamily: "var(--font-dm-sans,sans-serif)",
              fontSize: "clamp(0.95rem,1.5vw,1.12rem)",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.8,
              maxWidth: "44rem",
            }}
          >
            The garments on this site are our most-requested kit — but they&apos;re only a
            fraction of what we do. We don&apos;t just do polos. From{" "}
            <span style={{ color: "rgba(255,255,255,0.82)" }}>hi-vis and aprons</span> to
            trousers, jackets, fleeces and full PPE — if your team needs to wear it, we can
            professionally manufacture it and brand it to your business. No request is too specific.
          </p>
        </motion.div>

        {/* Capability grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mt-12 md:mt-16">
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.label}
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="group flex items-center gap-3 px-5 py-4 transition-all duration-300"
              style={{
                border: cap.highlight
                  ? "1px solid rgba(0,65,249,0.45)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: cap.highlight ? "rgba(0,65,249,0.07)" : "rgba(255,255,255,0.012)",
              }}
            >
              <span
                className="flex-shrink-0 w-[6px] h-[6px] rounded-full transition-all duration-300"
                style={{
                  background: cap.highlight ? "#C6AA72" : "#0041F9",
                  boxShadow: cap.highlight
                    ? "0 0 8px rgba(198,170,114,0.8)"
                    : "0 0 6px rgba(0,65,249,0.7)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-jetbrains,monospace)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: cap.highlight ? "#C6AA72" : "rgba(200,208,228,0.72)",
                }}
              >
                {cap.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Reassurance + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 md:mt-16 flex flex-col md:flex-row md:items-center gap-7 md:gap-10"
        >
          <p
            style={{
              fontFamily: "var(--font-dm-sans,sans-serif)",
              fontSize: "clamp(0.95rem,1.5vw,1.15rem)",
              color: "rgba(255,255,255,0.62)",
              lineHeight: 1.7,
              maxWidth: "30rem",
            }}
          >
            Can&apos;t see what you&apos;re looking for?{" "}
            <span style={{ color: "rgba(255,255,255,0.9)" }}>
              That&apos;s exactly what we&apos;re built for.
            </span>{" "}
            Tell us what your team needs and we&apos;ll quote it.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={openQuote}
              className="group relative overflow-hidden bg-blue text-white font-mono text-[11px] tracking-[0.14em] uppercase px-8 py-4 flex items-center gap-2.5 cursor-pointer"
            >
              <span className="relative z-10">Tell Us What You Need</span>
              <svg
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                width="13" height="13" viewBox="0 0 14 14" fill="none"
              >
                <path d="M2 7H12M7 2L12 7L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <a
              href="mailto:info@elevateworkwear.com?subject=Custom%20Workwear%20Enquiry"
              className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver hover:text-off-white transition-colors duration-300"
            >
              or email us →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
