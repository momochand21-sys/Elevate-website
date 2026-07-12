import type { Metadata } from "next";
import Link from "next/link";
import HoodieViewer360 from "@/components/ui/HoodieViewer360";
import HoodieQuoteFlow from "@/components/sections/HoodieQuoteFlow";
import BrandingPricingTable from "@/components/ui/BrandingPricingTable";

export const metadata: Metadata = {
  title: "Premium Workwear Hoodie | Elevate Workwear Solutions",
  description:
    "430 GSM premium workwear hoodie with embroidered branding. Regular UK fit, unisex. Available for bulk B2B orders.",
};

const SPECS = [
  { label: "Product Code",  value: "ELV-001"                    },
  { label: "Material",      value: "80% Polyester / 20% Cotton"  },
  { label: "Weight",        value: "430 GSM"                     },
  { label: "Fit",           value: "Regular UK Fit"              },
  { label: "Gender",        value: "Unisex"                      },
  { label: "Branding",      value: "Embroidery or Print"               },
  { label: "Pocket",        value: "Kangaroo Front Pocket"       },
  { label: "Industry",      value: "Workwear"                    },
];

const FEATURES = [
  { text: "Adjustable drawstrings" },
  { text: "Embroidered Elevate logo on left chest"               },
  { text: "Large branded back logo for maximum visibility"        },
  { text: "Ribbed cuffs and hem for a fitted finish"             },
  { text: "Kangaroo pocket — practical and structured"           },
  { text: "Available in custom colours for your brand"           },
  { text: "Choice of embroidery or print branding"              },
];

/* ── Reusable specs table (rendered in two places with responsive visibility) ── */
function SpecsTable() {
  return (
    <div>
      <p className="section-label mb-4">Specifications</p>
      <div className="flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {SPECS.map(s => (
          <div key={s.label} className="flex items-center justify-between py-3">
            <span style={{
              fontFamily: "var(--font-jetbrains,monospace)",
              fontSize: "0.6rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
            }}>
              {s.label}
            </span>
            <span style={{
              fontFamily: "var(--font-dm-sans,sans-serif)",
              fontSize: "0.82rem",
              color: "rgba(255,255,255,0.55)",
              textAlign: "right",
            }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HoodieDetailPage() {
  return (
    <main className="min-h-screen" style={{ background: "#050505" }}>

      {/* ── Breadcrumb ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-28 pb-0">
        <nav className="flex items-center gap-2" aria-label="Breadcrumb">
          {[
            { label: "Products", href: "/products"         },
            { label: "Hoodies",  href: "/products#hoodies" },
            { label: "Premium Workwear Hoodie", href: ""   },
          ].map((crumb, i, arr) => (
            <span key={crumb.label} className="flex items-center gap-2">
              {crumb.href ? (
                <Link href={crumb.href}
                  className="font-mono text-[8px] tracking-[0.18em] uppercase transition-colors duration-200 text-white/30 hover:text-white/65">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-mono text-[8px] tracking-[0.18em] uppercase"
                  style={{ color: "rgba(0,65,249,0.8)" }}>
                  {crumb.label}
                </span>
              )}
              {i < arr.length - 1 && (
                <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.6rem" }}>/</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* ── Product layout ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-0 lg:gap-10 items-start">

          {/* ══ LEFT COLUMN ══
              Desktop: 360° viewer (sticky) + specs below
              Mobile:  viewer only (specs appear inside right column) */}
          <div className="flex flex-col gap-10">

            {/* 360° Viewer — sticky on desktop */}
            <div className="relative w-full lg:sticky lg:top-[88px]" style={{ width: "100%", maxWidth: "min(460px, calc(65vh * 1200 / 1400))", margin: "0 auto" }}>
              <div style={{ paddingBottom: "116.67%" }} />
              <div className="absolute inset-0">
                <HoodieViewer360 />
              </div>
            </div>

            {/* Specs — desktop only, below the viewer */}
            <div className="hidden lg:block">
              <SpecsTable />
            </div>
          </div>

          {/* ══ RIGHT COLUMN ══
              Title · description · features · price · CTA
              + specs on mobile (hidden on desktop) */}
          <div className="py-6 lg:py-2 flex flex-col gap-8">

            {/* Title block */}
            <div>
              <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-3"
                style={{ color: "rgba(0,65,249,0.75)" }}>
                ELV-001 &nbsp;·&nbsp; Workwear Hoodie
              </p>
              <h1
                className="text-off-white mb-3"
                style={{
                  fontFamily: "var(--font-bebas,'Bebas Neue')",
                  fontSize: "clamp(2.2rem,4.5vw,3.8rem)",
                  letterSpacing: "0.04em",
                  lineHeight: 0.95,
                }}
              >
                Premium<br />Workwear Hoodie
              </h1>
              <p style={{
                fontFamily: "var(--font-jetbrains,monospace)",
                fontSize: "0.62rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
              }}>
                430 GSM · Athletic · Iconic
              </p>
            </div>

            {/* Divider */}
            <div className="h-[1px] w-full" style={{ background: "rgba(255,255,255,0.06)" }} />

            {/* Description */}
            <p style={{
              fontFamily: "var(--font-dm-sans,sans-serif)",
              fontSize: "clamp(0.85rem,1.2vw,0.95rem)",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.8,
            }}>
              Engineered for teams that demand performance and professional
              appearance. The Elevate Premium Workwear Hoodie is constructed
              from 430 GSM heavyweight fleece — durable, structured, and built
              to represent your brand at the highest level. Available fully
              embroidered or printed to your specification.
            </p>

            {/* Key features */}
            <div>
              <p className="section-label mb-4">Key Features</p>
              <ul className="flex flex-col gap-3">
                {FEATURES.map(f => (
                  <li key={f.text} className="flex items-start gap-3">
                    <span style={{ color: "#0041F9", fontSize: "0.6rem", marginTop: "0.15rem", flexShrink: 0 }}>
                      ◈
                    </span>
                    <span style={{
                      fontFamily: "var(--font-dm-sans,sans-serif)",
                      fontSize: "0.875rem",
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.5,
                    }}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Divider */}
            <div className="h-[1px] w-full" style={{ background: "rgba(255,255,255,0.06)" }} />

            {/* ── Price ── */}
            <div>
              <p className="section-label mb-3">Pricing</p>
              <div className="flex items-baseline gap-3 mb-1">
                <span
                  style={{
                    fontFamily: "var(--font-bebas,'Bebas Neue')",
                    fontSize: "clamp(2.4rem,4vw,3.2rem)",
                    letterSpacing: "0.04em",
                    color: "#F5F5F3",
                    lineHeight: 1,
                  }}
                >
                  On Quote
                </span>
                <span style={{
                  fontFamily: "var(--font-jetbrains,monospace)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                }}>
                  per unit
                </span>
              </div>
              <p style={{
                fontFamily: "var(--font-jetbrains,monospace)",
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.2)",
              }}>
                Personalised quote · Volume discounts available
              </p>
            </div>

            {/* ── Branding & volume pricing table ── */}
            <BrandingPricingTable />

            {/* Divider */}
            <div className="h-[1px] w-full" style={{ background: "rgba(255,255,255,0.06)" }} />

            {/* ── Quote Flow ── */}
            <HoodieQuoteFlow productName="Premium Workwear Hoodie" />

            {/* Back link */}
            <Link href="/products">
              <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase text-muted hover:text-off-white transition-colors duration-200 cursor-pointer">
                ← Back to Products
              </span>
            </Link>

            {/* Specs — mobile only (hidden on desktop, shown in left col instead) */}
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
