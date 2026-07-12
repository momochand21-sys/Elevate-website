"use client";

import Link from "next/link";
import HiVisVestViewer360 from "@/components/ui/HiVisVestViewer360";
import { useQuoteModal } from "@/lib/quote-modal-context";

const SPECS = [
  { label: "Product Code", value: "ELV-008" },
  { label: "Style",        value: "Hi-Vis Safety Vest" },
  { label: "Colour",       value: "Hi-Vis Yellow" },
  { label: "Standard",     value: "Reflective Tape" },
  { label: "Shell",        value: "100% Polyester" },
  { label: "Fit",          value: "Regular UK Fit" },
  { label: "Gender",       value: "Unisex" },
  { label: "Closure",      value: "Zip Front" },
  { label: "Branding",     value: "Embroidery or Print" },
];

const FEATURES = [
  { text: "High-visibility yellow shell for maximum on-site safety" },
  { text: "Reflective tape to front and back for 360° visibility" },
  { text: "Lightweight, breathable build — layers over any uniform" },
  { text: "Zip-front closure for quick on and off" },
  { text: "Embroidered or printed branding for your business" },
  { text: "Regular UK fit — unisex sizing" },
  { text: "Ideal for site visitors, warehouse and outdoor teams" },
  { text: "Also available made to order in hi-vis orange & other styles" },
];

function SpecsTable() {
  return (
    <div>
      <p className="section-label mb-4">Specifications</p>
      <div className="flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {SPECS.map(s => (
          <div key={s.label} className="flex items-center justify-between py-3">
            <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>{s.label}</span>
            <span style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", textAlign: "right" }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HiVisVestPage() {
  const { open: openQuote } = useQuoteModal();

  const CRUMBS = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "PPE & Safety Wear", href: "/products#ppe" },
    { label: "Hi-Vis Safety Vest" },
  ];

  return (
    <main className="min-h-screen" style={{ background: "#050505" }}>
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-32 md:pt-36">
        <nav className="flex items-center gap-2" aria-label="Breadcrumb">
          {CRUMBS.map((crumb, i, arr) => (
            <span key={crumb.label} className="flex items-center gap-2">
              {crumb.href ? (
                <Link href={crumb.href} className="font-mono text-[8px] tracking-[0.18em] uppercase transition-colors duration-200 text-white/30 hover:text-white/65">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-mono text-[8px] tracking-[0.18em] uppercase" style={{ color: "rgba(0,65,249,0.8)" }}>{crumb.label}</span>
              )}
              {i < arr.length - 1 && (
                <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.6rem" }}>/</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Product layout */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-0 lg:gap-10 items-start">

          {/* LEFT: viewer + specs */}
          <div className="flex flex-col gap-10">
            <div className="relative w-full lg:sticky overflow-hidden" style={{ top: "88px", aspectRatio: "1024/1536", maxHeight: "90vh", width: "100%", background: "#0A0A0E", border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* subtle glow */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,65,249,0.08) 0%, transparent 70%)" }} />
              <HiVisVestViewer360 />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10"
                style={{ background: "rgba(4,4,8,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,65,249,0.3)", padding: "3px 8px" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#0041F9", boxShadow: "0 0 6px rgba(0,65,249,0.8)" }} />
                <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.45rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(180,190,220,0.75)" }}>Front · Side · Back</span>
              </div>
            </div>
            <div className="hidden lg:block"><SpecsTable /></div>
          </div>

          {/* RIGHT: info */}
          <div className="py-6 lg:py-2 flex flex-col gap-8">
            <div>
              <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: "rgba(0,65,249,0.75)" }}>
                ELV-008 &nbsp;·&nbsp; PPE &amp; Safety Wear
              </p>
              <h1 className="text-off-white mb-3" style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "clamp(2.2rem,4.5vw,3.8rem)", letterSpacing: "0.04em", lineHeight: 0.95 }}>
                Hi-Vis<br />Safety Vest
              </h1>
              <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                Hi-Vis Yellow · Reflective · Lightweight
              </p>
            </div>

            <div className="h-[1px] w-full" style={{ background: "rgba(255,255,255,0.06)" }} />

            <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "clamp(0.85rem,1.2vw,0.95rem)", color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>
              A lightweight high-visibility vest built to keep your team safe and seen on any site.
              Reflective tape to the front and back meets high-vis requirements, while the breathable
              build layers easily over any uniform. Fully customisable with your embroidered or
              printed branding — ideal for teams, contractors and site visitors alike.
            </p>

            <div>
              <p className="section-label mb-4">Key Features</p>
              <ul className="flex flex-col gap-3">
                {FEATURES.map(f => (
                  <li key={f.text} className="flex items-start gap-3">
                    <span style={{ color: "#0041F9", fontSize: "0.6rem", marginTop: "0.15rem", flexShrink: 0 }}>◈</span>
                    <span style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-[1px] w-full" style={{ background: "rgba(255,255,255,0.06)" }} />

            <div>
              <p className="section-label mb-3">Pricing</p>
              <div className="flex items-baseline gap-3 mb-1">
                <span style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "clamp(2.4rem,4vw,3.2rem)", letterSpacing: "0.04em", color: "#F5F5F3", lineHeight: 1 }}>
                  On Quote
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                  per unit
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
                Personalised quote · Volume discounts available
              </p>
            </div>

            <button onClick={openQuote}
              className="group flex items-center justify-center gap-2.5 bg-blue text-white px-8 py-4 cursor-pointer w-full sm:w-auto self-start"
              style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Request a Quote
              <svg className="transition-transform duration-300 group-hover:translate-x-1" width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 7H12M7 2L12 7L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <Link href="/products">
              <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase text-muted hover:text-off-white transition-colors duration-200 cursor-pointer">
                ← Back to Products
              </span>
            </Link>

            <div className="lg:hidden">
              <div className="h-[1px] w-full mb-8" style={{ background: "rgba(255,255,255,0.06)" }} />
              <SpecsTable />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
