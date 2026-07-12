import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ApronQuoteFlow from "@/components/sections/ApronQuoteFlow";
import BrandingPricingTable from "@/components/ui/BrandingPricingTable";

export const metadata: Metadata = {
  title: "Workwear Apron | Elevate Workwear Solutions",
  description:
    "Durable poly/cotton workwear apron with embroidered or printed branding. One size, unisex. Available for bulk B2B orders.",
};

const SPECS = [
  { label: "Product Code", value: "ELV-009" },
  { label: "Style",        value: "Workwear Apron" },
  { label: "Colour",       value: "Black" },
  { label: "Fabric",       value: "Poly/Cotton Twill" },
  { label: "Pockets",      value: "Front Patch Pocket" },
  { label: "Closure",      value: "Adjustable Neck & Waist Ties" },
  { label: "Fit",          value: "One Size" },
  { label: "Gender",       value: "Unisex" },
  { label: "Branding",     value: "Embroidery or Print" },
];

const FEATURES = [
  { text: "Durable poly/cotton twill built for daily kitchen and bar use" },
  { text: "Front patch pocket for essentials and order pads" },
  { text: "Adjustable neck strap and waist ties for a comfortable fit" },
  { text: "Embroidered or printed branding for your business" },
  { text: "One size — fits most, unisex" },
  { text: "Ideal for hospitality, retail and food service teams" },
  { text: "Also available made to order in tabards and other colours" },
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

export default function ApronPage() {
  const CRUMBS = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Hospitality Wear", href: "/products#hospitality" },
    { label: "Workwear Apron" },
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

          {/* LEFT: image + specs */}
          <div className="flex flex-col gap-10">
            <div className="relative w-full lg:sticky lg:top-[88px]" style={{ width: "100%", maxWidth: "min(460px, calc(65vh * 1200 / 1400))", margin: "0 auto" }}>
              <div style={{ paddingBottom: "116.67%" }} />
              <div className="absolute inset-0 overflow-hidden flex items-center justify-center" style={{ background: "#0A0A0E", border: "1px solid rgba(255,255,255,0.06)" }}>
                {/* subtle glow */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,65,249,0.08) 0%, transparent 70%)" }} />
                <Image src="/products/apron/apron-000.png" alt="Workwear Apron" width={1024} height={1536}
                  className="relative z-10"
                  style={{ width: "80%", height: "80%", objectFit: "contain", filter: "brightness(1.05)" }}
                  sizes="(max-width:1024px) 90vw, 45vw" priority />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10"
                  style={{ background: "rgba(4,4,8,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,65,249,0.3)", padding: "3px 8px" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#0041F9", boxShadow: "0 0 6px rgba(0,65,249,0.8)" }} />
                  <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.45rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(180,190,220,0.75)" }}>Front View</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block"><SpecsTable /></div>
          </div>

          {/* RIGHT: info */}
          <div className="py-6 lg:py-2 flex flex-col gap-8">
            <div>
              <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: "rgba(0,65,249,0.75)" }}>
                ELV-009 &nbsp;·&nbsp; Hospitality Wear
              </p>
              <h1 className="text-off-white mb-3" style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "clamp(2.2rem,4.5vw,3.8rem)", letterSpacing: "0.04em", lineHeight: 0.95 }}>
                Workwear<br />Apron
              </h1>
              <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                Poly/Cotton · Pocket Front · Adjustable
              </p>
            </div>

            <div className="h-[1px] w-full" style={{ background: "rgba(255,255,255,0.06)" }} />

            <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "clamp(0.85rem,1.2vw,0.95rem)", color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>
              A durable, professional apron built for kitchens, bars and front-of-house teams.
              The front patch pocket keeps essentials to hand, while the adjustable neck and
              waist ties give a comfortable fit for any body shape. Fully customisable with your
              embroidered or printed branding.
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

            <BrandingPricingTable />
            <div className="h-[1px] w-full" style={{ background: "rgba(255,255,255,0.06)" }} />
            <ApronQuoteFlow productName="Workwear Apron" />

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
