"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FEATURED_BUNDLE } from "@/lib/bundles";

const INCLUDED = [
  "5 Premium Polos",
  "5 Premium Hoodies",
  "Choice of 1 Premium Gilet or 1 Premium 1/4 Zip",
  "Free Embroidered Logo On Every Item",
];

export default function FeaturedBundle() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  const b = FEATURED_BUNDLE;

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden py-24 md:py-32"
      style={{ background: "#070708" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 55% 60% at 70% 45%, rgba(0,65,249,0.08) 0%, transparent 70%)" }}/>
      {/* Separators */}
      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "rgba(255,255,255,0.05)" }}/>
      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: "rgba(255,255,255,0.05)" }}/>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-4" style={{ border: "1px solid rgba(0,65,249,0.4)", background: "rgba(0,65,249,0.08)", padding: "6px 14px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0041F9", boxShadow: "0 0 8px rgba(0,65,249,0.9)" }}/>
            <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(200,208,228,0.85)" }}>
              Most Popular Starter Bundle
            </span>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(10,10,14,0.6)" }}
          className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden"
        >
          {/* Image side */}
          <div className="relative flex items-center justify-center p-8 md:p-12"
            style={{ background: "#0A0A0E", minHeight: "340px" }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,65,249,0.1) 0%, transparent 70%)" }}/>
            <Image src={b.image} alt={b.name} width={1400} height={900}
              className="relative z-10" style={{ width: "100%", height: "auto", maxHeight: "420px", objectFit: "contain" }} />
            {/* Save badge */}
            <div className="absolute top-5 left-5 z-20" style={{ background: "rgba(0,65,249,0.92)", padding: "7px 14px" }}>
              <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff", fontWeight: 500 }}>
                Save Over £35
              </span>
            </div>
            {/* Free logo badge */}
            <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5"
              style={{ background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.5)", padding:"7px 14px" }}>
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4 7.5L8 2.5" stroke="#4ade80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.6rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#4ade80", fontWeight:500 }}>
                Free Logo Setup
              </span>
            </div>
          </div>

          {/* Detail side */}
          <div className="p-8 md:p-12 flex flex-col justify-center gap-6">
            <div>
              <h2 className="text-off-white mb-3" style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "clamp(2.2rem,4vw,3.4rem)", letterSpacing: "0.03em", lineHeight: 0.95 }}>
                {b.name}
              </h2>
              <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                Everything a small business needs to outfit a new team.
              </p>
            </div>

            {/* Checklist */}
            <ul className="flex flex-col gap-2.5">
              {INCLUDED.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.3 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3"
                >
                  <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#0041F9" }}>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.88rem", color: "rgba(255,255,255,0.7)" }}>
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* Savings badge */}
            <div className="inline-flex" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.35)", padding: "6px 13px" }}>
              <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#4ade80" }}>
                Save Over £35
              </span>
            </div>

            {/* CTA */}
            <Link href={`/products/bundles/${b.slug}`}>
              <span className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto font-mono text-[11px] tracking-[0.16em] uppercase text-white transition-all duration-300 cursor-pointer"
                style={{ background: "#0041F9", padding: "16px 32px" }}>
                Build My Starter Pack
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6H10M6 2L10 6L6 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
