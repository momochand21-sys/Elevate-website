"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

const FEATURES = [
  { label: "Fully Embroidered Branding"  },
  { label: "Regular UK Fit — Unisex"     },
  { label: "Available in Bulk Orders"    },
];

export default function ProductTeaser() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      ref={ref}
      id="products"
      className="relative w-full overflow-hidden py-28 md:py-40"
      style={{ background: "#050505" }}
    >
      {/* Ambient glow — very subtle, matches site tone */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 55% at 50% 50%, rgba(0,65,249,0.03) 0%, transparent 70%)",
        }}
      />

      {/* Subtle noise */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.03 }}
        aria-hidden
      >
        <filter id="pt-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65 0.32"
            numOctaves="4" seed="5" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#pt-noise)" fill="white"/>
      </svg>

      {/* Top separator line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="max-w-2xl">

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="section-label mb-5">Our Products</p>

            <h2
              className="text-off-white mb-6"
              style={{
                fontFamily: "var(--font-bebas,'Bebas Neue')",
                fontSize: "clamp(2.6rem,5.5vw,4.5rem)",
                letterSpacing: "0.04em",
                lineHeight: 0.95,
              }}
            >
              Premium Branded<br />
              <span style={{ color: "rgba(255,255,255,0.28)" }}>
                Workwear, Your Way.
              </span>
            </h2>

            <p
              className="mb-10"
              style={{
                fontFamily: "var(--font-dm-sans,sans-serif)",
                fontSize: "clamp(0.875rem,1.4vw,1rem)",
                color: "rgba(255,255,255,0.42)",
                lineHeight: 1.75,
                maxWidth: "36rem",
              }}
            >
              From hoodies and polos to caps, beanies and gilets — every garment
              produced to your exact specification. Your logo. Your colour.
              Your standard.
            </p>
          </motion.div>

          {/* Features */}
          <ul className="flex flex-col gap-3 mb-10">
            {FEATURES.map((f, i) => (
              <motion.li
                key={f.label}
                initial={{ opacity: 0, x: -12 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3"
              >
                <div
                  className="flex-shrink-0 w-[5px] h-[5px] rounded-full"
                  style={{ background: "#0041F9", boxShadow: "0 0 6px rgba(0,65,249,0.7)" }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains,monospace)",
                    fontSize: "0.62rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(200,208,228,0.65)",
                  }}
                >
                  {f.label}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/products">
              <span className="inline-flex items-center gap-2.5 font-mono text-[10px] tracking-[0.16em] uppercase text-off-white border border-blue/60 hover:border-blue hover:bg-blue/10 transition-all duration-300 px-7 py-3.5 cursor-pointer">
                View All Products
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6H10M6 2L10 6L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Bottom separator line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
    </section>
  );
}
