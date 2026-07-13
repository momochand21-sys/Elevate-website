import type { Metadata } from "next";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { BUNDLES } from "@/lib/bundles";

export const metadata: Metadata = {
  title: "Bundle Deals | Elevate Workwear Solutions",
  description:
    "Pre-built workwear bundles at a lower combined price than buying each garment individually. Hoodies, polos, 1/4 zips, gilets and headwear — fully branded to your specification.",
};

export default function BundleDealsPage() {
  return (
    <main className="min-h-screen" style={{ background: "#050505" }}>

      {/* ── Page header ── */}
      <section className="relative overflow-hidden pt-36 pb-14 px-6 md:px-12 max-w-[1400px] mx-auto">
        <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-3"
          style={{ color: "rgba(0,65,249,0.7)" }}>
          Save More, Kit Out Faster
        </p>
        <h1 className="text-off-white"
          style={{
            fontFamily: "var(--font-bebas,'Bebas Neue')",
            fontSize: "clamp(3rem,7vw,6rem)",
            letterSpacing: "0.04em",
            lineHeight: 0.95,
          }}>
          Bundle<br />
          <span style={{ color: "rgba(255,255,255,0.22)" }}>Deals</span>
        </h1>
        <p className="mt-5 max-w-lg"
          style={{
            fontFamily: "var(--font-dm-sans,sans-serif)",
            fontSize: "clamp(0.875rem,1.4vw,1rem)",
            color: "rgba(255,255,255,0.38)",
            lineHeight: 1.7,
          }}>
          Pre-built kits at a lower combined price than buying each garment on its
          own. Configure sizes and branding, then add the whole bundle to your
          basket in one click.
        </p>
        <div className="mt-10 h-[1px] w-32"
          style={{ background: "linear-gradient(to right, rgba(0,65,249,0.6), transparent)" }}/>
      </section>

      {/* ── Bundles grid ── */}
      <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {BUNDLES.map((b, idx) => (
            <Link key={b.slug} href={`/products/bundles/${b.slug}`} className="group block">
              <div style={{ background:"rgba(10,10,14,0.7)", border:"1px solid rgba(255,255,255,0.06)" }}
                className={`group-hover:border-blue/40 transition-all duration-300 overflow-hidden flex flex-col h-full ${idx === BUNDLES.length - 1 && BUNDLES.length % 2 === 1 ? "md:col-span-2" : ""}`}>

                {/* Bundle image */}
                <div className="relative bg-[#0A0A0E] flex items-center justify-center overflow-hidden"
                  style={{ aspectRatio: idx === BUNDLES.length - 1 && BUNDLES.length % 2 === 1 ? "21/9" : "16/9" }}>
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background:"radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,65,249,0.08) 0%, transparent 70%)" }}/>
                  <Image src={b.image} alt={b.name} width={1400} height={787}
                    className="relative z-10 transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ width:"auto", height:"62%", maxWidth:"84%", objectFit:"contain", filter:"brightness(1.05)" }}
                    sizes="(max-width:768px) 90vw, 45vw"/>

                  {/* Saving badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5"
                    style={{ background:"rgba(0,65,249,0.9)", padding:"4px 10px" }}>
                    <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#fff" }}>
                      Save Over £35
                    </span>
                  </div>


                  {/* Free logo badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5"
                    style={{ background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.5)", padding:"4px 10px" }}>
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7.5L8 2.5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#4ade80" }}>
                      Free Logo Setup
                    </span>
                  </div>
                  {/* View arrow */}
                  <div className="absolute bottom-3 right-3 w-7 h-7 border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ background:"rgba(0,65,249,0.15)", borderColor:"rgba(0,65,249,0.4)" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5h6M5 2l3 3-3 3" stroke="#0041F9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex items-end justify-between gap-4 flex-1">
                  <div className="flex flex-col gap-1">
                    <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(0,65,249,0.55)" }}>{b.code}</p>
                    <h3 className="text-off-white leading-tight" style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.3rem", letterSpacing:"0.04em" }}>{b.name}</h3>
                    <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)" }}>{b.tagline}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Back to all products */}
        <div className="mt-12">
          <Link href="/products">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase text-muted hover:text-off-white transition-colors duration-200 cursor-pointer">
              ← Browse all products
            </span>
          </Link>
        </div>
      </section>

      <CTA />
      <Footer />
    </main>
  );
}
