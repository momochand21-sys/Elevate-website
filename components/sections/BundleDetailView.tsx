"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Bundle, ProductKey } from "@/lib/bundles";
import BundleConfigurator from "@/components/sections/BundleConfigurator";

const OUTER_RETAIL: Record<string, number> = { gilet: 26.99, quarterzip: 24.99 };
const OUTER_NAME:   Record<string, string> = { gilet: "Premium Workwear Gilet", quarterzip: "Premium Workwear 1/4 Zip" };

export default function BundleDetailView({ bundle }: { bundle: Bundle }) {
  const choice = bundle.choice;
  const [outerKey, setOuterKey] = useState<ProductKey | undefined>(choice?.options[0].key);
  /* Until the customer explicitly picks an outer layer, show the combined
     lineup (all garments incl. both gilet & 1/4 zip). After a pick, narrow
     the hero image to the chosen composite. */
  const [hasPicked, setHasPicked] = useState(false);

  const handleOuterChange = (key: ProductKey) => { setOuterKey(key); setHasPicked(true); };

  const currentImage = useMemo(() => {
    if (hasPicked && choice && outerKey) {
      const opt = choice.options.find(o => o.key === outerKey);
      if (opt) return opt.image;
    }
    return bundle.image;
  }, [hasPicked, choice, outerKey, bundle.image]);

  /* Display list of garments incl. the chosen outer layer */
  const displayLines = useMemo(() => {
    const lines = bundle.lines.map(l => ({ label: `${l.qty}× ${l.name}`, value: l.retail * l.qty }));
    if (choice && outerKey) {
      lines.push({ label: `${choice.qty}× ${OUTER_NAME[outerKey]}`, value: OUTER_RETAIL[outerKey] * choice.qty });
    }
    return lines;
  }, [bundle.lines, choice, outerKey]);

  const totalUnits   = bundle.lines.reduce((s, l) => s + l.qty, 0) + (choice?.qty ?? 0);
  const embValue     = bundle.includedBranding
    ? +((bundle.includedBrandingRetail ?? 0) * totalUnits).toFixed(2)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-10 items-start">

      {/* LEFT: image + contents */}
      <div className="flex flex-col gap-8 lg:sticky" style={{ top: "88px" }}>
        <div className="relative w-full flex items-center justify-center" style={{ aspectRatio: "16/10" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,65,249,0.07) 0%, transparent 72%)" }}/>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full h-full flex items-center justify-center"
            >
              <Image src={currentImage} alt={bundle.name} width={1600} height={1000}
                style={{ width: "100%", height: "100%", objectFit: "contain" }} priority />
            </motion.div>
          </AnimatePresence>
          {/* Saving badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 z-20"
            style={{ background: "rgba(0,65,249,0.92)", padding: "5px 11px" }}>
            <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#fff" }}>
              Save Over £35
            </span>
          </div>
        </div>

        {/* Contents list */}
        <div>
          <p className="section-label mb-4">What&apos;s Included</p>
          <div className="flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {displayLines.map((l, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.85rem", color:"rgba(255,255,255,0.6)" }}>{l.label}</span>
                <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)" }}>Included</span>
              </div>
            ))}
            {bundle.includedBranding && embValue > 0 && (
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2" style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.85rem", color:"rgba(255,255,255,0.6)" }}>
                  {bundle.includedBranding.label}
                  <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.42rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#4ade80", border:"1px solid rgba(74,222,128,0.4)", padding:"2px 6px" }}>Included</span>
                </span>
                <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#4ade80" }}>Free</span>
              </div>
            )}
            {/* per-item retail comparison hidden — full pricing provided on quote */}
          </div>
        </div>
      </div>

      {/* RIGHT: info + configurator */}
      <div className="py-2 flex flex-col gap-8">
        <div>
          <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: "rgba(0,65,249,0.75)" }}>
            {bundle.code} &nbsp;·&nbsp; Most Popular Bundle
          </p>
          <h1 className="text-off-white mb-3" style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"clamp(2.2rem,4.5vw,3.6rem)", letterSpacing:"0.04em", lineHeight:0.95 }}>
            {bundle.name}
          </h1>
          <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.62rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)" }}>
            {bundle.tagline}
          </p>
        </div>

        <div className="h-[1px] w-full" style={{ background: "rgba(255,255,255,0.06)" }}/>

        <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"clamp(0.85rem,1.2vw,0.95rem)", color:"rgba(255,255,255,0.45)", lineHeight:1.8 }}>
          {bundle.description}
        </p>

        {/* Perfect for */}
        {bundle.perfectFor && bundle.perfectFor.length > 0 && (
          <div>
            <p className="section-label mb-3">Perfect For</p>
            <div className="flex flex-wrap gap-2">
              {bundle.perfectFor.map(p => (
                <span key={p} style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.55)", border:"1px solid rgba(255,255,255,0.1)", padding:"6px 11px" }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Savings badge */}
        <div className="inline-flex items-center gap-2" style={{ background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", padding:"5px 12px" }}>
          <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#4ade80" }}>
            Save Over £35
          </span>
        </div>

        {/* Free logo setup callout — prominent attention-grabber */}
        <div className="flex items-center gap-3"
          style={{ padding:"14px 18px", background:"linear-gradient(135deg, rgba(0,65,249,0.12) 0%, rgba(0,65,249,0.06) 100%)", border:"1px solid rgba(0,65,249,0.4)" }}>
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background:"#0041F9" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.05rem", letterSpacing:"0.05em", color:"#fff", lineHeight:1, marginBottom:2 }}>
              Free Logo Setup Included
            </p>
            <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(74,222,128,0.8)" }}>
              No digitising charge · Your logo ready to embroider
            </p>
          </div>
        </div>

        <div className="h-[1px] w-full" style={{ background: "rgba(255,255,255,0.06)" }}/>

        <BundleConfigurator bundle={bundle} outerKey={outerKey} onOuterChange={handleOuterChange} />

        <Link href="/products">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase text-muted hover:text-off-white transition-colors duration-200 cursor-pointer">
            ← Back to Products
          </span>
        </Link>
      </div>
    </div>
  );
}
