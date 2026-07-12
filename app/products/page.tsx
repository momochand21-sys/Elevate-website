import type { Metadata } from "next";
import CTA from "@/components/sections/CTA";
import BeyondCatalogue from "@/components/sections/BeyondCatalogue";
import ProductBrowser from "@/components/sections/ProductBrowser";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { FEATURED_BUNDLE } from "@/lib/bundles";

export const metadata: Metadata = {
  title: "Products | Elevate Workwear Solutions",
  description:
    "Explore our premium B2B workwear range — hoodies, polo shirts, caps, beanies, gilets and more. Fully branded to your specification.",
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen" style={{ background: "#050505" }}>

      {/* ── Page header ── */}
      <section className="relative overflow-hidden pt-36 pb-14 px-6 md:px-12 max-w-[1400px] mx-auto">
        <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-3"
          style={{ color: "rgba(0,65,249,0.7)" }}>
          The Full Range
        </p>
        <h1 className="text-off-white"
          style={{
            fontFamily: "var(--font-bebas,'Bebas Neue')",
            fontSize: "clamp(3rem,7vw,6rem)",
            letterSpacing: "0.04em",
            lineHeight: 0.95,
          }}>
          Premium<br />
          <span style={{ color: "rgba(255,255,255,0.22)" }}>Branded Workwear</span>
        </h1>
        <p className="mt-5 max-w-lg"
          style={{
            fontFamily: "var(--font-dm-sans,sans-serif)",
            fontSize: "clamp(0.875rem,1.4vw,1rem)",
            color: "rgba(255,255,255,0.38)",
            lineHeight: 1.7,
          }}>
          Every garment produced to your exact specification — logo, colour, and
          quantity. Minimum orders available for all categories.
        </p>
        <div className="mt-10 h-[1px] w-32"
          style={{ background: "linear-gradient(to right, rgba(0,65,249,0.6), transparent)" }}/>
      </section>

      {/* ══════════════════════════════════════════
          SHOP BY CATEGORY — tabbed product browser
          Category boxes act as tabs; products live inside them.
      ══════════════════════════════════════════ */}
      <ProductBrowser />

      {/* ══════════════════════════════════════════
          FEATURED BUNDLE — links to the bundle detail page
      ══════════════════════════════════════════ */}
      <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-20">
        <div className="flex items-center gap-2 mb-5">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0041F9", boxShadow: "0 0 8px rgba(0,65,249,0.9)" }}/>
          <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(200,208,228,0.8)" }}>
            Most Popular Bundle
          </p>
        </div>
        <Link href={`/products/bundles/${FEATURED_BUNDLE.slug}`} className="group block">
          <div className="relative overflow-hidden grid grid-cols-1 md:grid-cols-2"
            style={{ background:"rgba(10,10,14,0.7)", border:"1px solid rgba(0,65,249,0.25)" }}>
            {/* Image */}
            <div className="relative flex items-center justify-center p-8" style={{ background:"#0A0A0E", minHeight:"260px" }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background:"radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,65,249,0.1) 0%, transparent 70%)" }}/>
              <Image src={FEATURED_BUNDLE.image} alt={FEATURED_BUNDLE.name} width={1400} height={787}
                className="relative z-10 transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ width:"100%", height:"auto", maxHeight:"320px", objectFit:"contain", filter:"brightness(1.05)" }}
                sizes="(max-width:768px) 90vw, 45vw"/>
              <div className="absolute top-4 left-4 z-20" style={{ background:"rgba(0,65,249,0.92)", padding:"6px 13px" }}>
                <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#fff" }}>
                  Save Over £35
                </span>
              </div>
            </div>
            {/* Free logo badge */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5"
              style={{ background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.5)", padding:"5px 11px" }}>
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4 7.5L8 2.5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#4ade80" }}>
                Free Logo Setup
              </span>
            </div>
            {/* Detail */}
            <div className="p-8 md:p-10 flex flex-col justify-center gap-5">
              <div>
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(0,65,249,0.6)", marginBottom:8 }}>{FEATURED_BUNDLE.code}</p>
                <h2 className="text-off-white mb-2" style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"clamp(1.8rem,3.2vw,2.6rem)", letterSpacing:"0.04em", lineHeight:0.95 }}>
                  {FEATURED_BUNDLE.name}
                </h2>
                <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.85rem", color:"rgba(255,255,255,0.45)", lineHeight:1.6 }}>
                  5 Polos · 5 Hoodies · Choice of Gilet or 1/4 Zip · Free Embroidered Logo On Every Item
                </p>
              </div>
              <span className="inline-flex items-center gap-2.5 self-start"
                style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.6rem", letterSpacing:"0.16em", textTransform:"uppercase", color:"#fff", background:"#0041F9", padding:"14px 26px" }}>
                Build My Starter Pack
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6H10M6 2L10 6L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </section>

      <BeyondCatalogue />

      <CTA />
      <Footer />
    </main>
  );
}
