import type { Metadata } from "next";
import Link from "next/link";
import GiletViewer360 from "@/components/ui/GiletViewer360";
import GiletQuoteFlow from "@/components/sections/GiletQuoteFlow";
import BrandingPricingTable from "@/components/ui/BrandingPricingTable";

export const metadata: Metadata = {
  title: "Premium Workwear Gilet | Elevate Workwear Solutions",
  description:
    "Sleeveless workwear gilet with embroidered or printed branding. Regular UK fit, unisex. Available for bulk B2B orders.",
};

const SPECS = [
  { label: "Product Code",  value: "ELV-005"                         },
  { label: "Style",         value: "Sleeveless Workwear Jacket"      },
  { label: "Weight",        value: "180 GSM"                          },
  { label: "Shell",         value: "100% Polyester"                  },
  { label: "Fill",          value: "Padded Quilted Insulation"       },
  { label: "Fit",           value: "Regular UK Fit"                  },
  { label: "Gender",        value: "Unisex"                          },
  { label: "Closure",       value: "Full-Length Zip"                 },
  { label: "Branding",      value: "Embroidery or Print"             },
  { label: "Industry",      value: "Workwear"                        },
];

const FEATURES = [
  { text: "Quilted padded construction for warmth without sleeves"   },
  { text: "Full-length zip for easy on and off"                      },
  { text: "Embroidered chest logo for a professional finish"          },
  { text: "Large branded back print for maximum visibility"           },
  { text: "Side zip pockets for secure storage on site"              },
  { text: "Regular UK fit — suitable for layering over uniforms"     },
  { text: "Available in custom colours for your brand"               },
  { text: "Choice of embroidery or print branding"                   },
];

function SpecsTable() {
  return (
    <div>
      <p className="section-label mb-4">Specifications</p>
      <div className="flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {SPECS.map(s => (
          <div key={s.label} className="flex items-center justify-between py-3">
            <span style={{
              fontFamily: "var(--font-jetbrains,monospace)",
              fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
            }}>{s.label}</span>
            <span style={{
              fontFamily: "var(--font-dm-sans,sans-serif)",
              fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", textAlign: "right",
            }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GiletDetailPage() {
  return (
    <main className="min-h-screen" style={{ background: "#050505" }}>

      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-28 pb-0">
        <nav className="flex items-center gap-2" aria-label="Breadcrumb">
          {[
            { label: "Products", href: "/products"        },
            { label: "Gilets",   href: "/products#gilets" },
            { label: "Premium Workwear Gilet", href: ""   },
          ].map((crumb, i, arr) => (
            <span key={crumb.label} className="flex items-center gap-2">
              {crumb.href ? (
                <Link href={crumb.href}
                  className="font-mono text-[8px] tracking-[0.18em] uppercase transition-colors duration-200 text-white/30 hover:text-white/65">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-mono text-[8px] tracking-[0.18em] uppercase"
                  style={{ color: "rgba(0,65,249,0.8)" }}>{crumb.label}</span>
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
            <div className="relative w-full lg:sticky" style={{ top: "88px", width: "100%", maxWidth: "min(460px, calc(65vh * 1200 / 1400))", margin: "0 auto" }}>
              <div style={{ paddingBottom: "116.67%" }} />
              <div className="absolute inset-0">
                <GiletViewer360 />
              </div>
            </div>
            <div className="hidden lg:block"><SpecsTable /></div>
          </div>

          {/* RIGHT: info */}
          <div className="py-6 lg:py-2 flex flex-col gap-8">

            <div>
              <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-3"
                style={{ color: "rgba(0,65,249,0.75)" }}>
                ELV-005 &nbsp;·&nbsp; Workwear Gilet
              </p>
              <h1 className="text-off-white mb-3" style={{
                fontFamily: "var(--font-bebas,'Bebas Neue')",
                fontSize: "clamp(2.2rem,4.5vw,3.8rem)",
                letterSpacing: "0.04em", lineHeight: 0.95,
              }}>
                Premium<br />Workwear Gilet
              </h1>
              <p style={{
                fontFamily: "var(--font-jetbrains,monospace)",
                fontSize: "0.62rem", letterSpacing: "0.12em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
              }}>
                Quilted · Sleeveless · Full-Zip
              </p>
            </div>

            <div className="h-[1px] w-full" style={{ background: "rgba(255,255,255,0.06)" }}/>

            <p style={{
              fontFamily: "var(--font-dm-sans,sans-serif)",
              fontSize: "clamp(0.85rem,1.2vw,0.95rem)",
              color: "rgba(255,255,255,0.45)", lineHeight: 1.8,
            }}>
              A premium padded workwear gilet built for professionals who need warmth
              without restriction. The quilted sleeveless design layers perfectly over
              any uniform, keeping your team comfortable and on-brand throughout the
              working day. Fully customisable with embroidery or print branding.
            </p>

            <div>
              <p className="section-label mb-4">Key Features</p>
              <ul className="flex flex-col gap-3">
                {FEATURES.map(f => (
                  <li key={f.text} className="flex items-start gap-3">
                    <span style={{ color:"#0041F9", fontSize:"0.6rem", marginTop:"0.15rem", flexShrink:0 }}>◈</span>
                    <span style={{
                      fontFamily:"var(--font-dm-sans,sans-serif)",
                      fontSize:"0.875rem", color:"rgba(255,255,255,0.5)", lineHeight:1.5,
                    }}>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-[1px] w-full" style={{ background: "rgba(255,255,255,0.06)" }}/>

            <div>
              <p className="section-label mb-3">Pricing</p>
              <div className="flex items-baseline gap-3 mb-1">
                <span style={{
                  fontFamily:"var(--font-bebas,'Bebas Neue')",
                  fontSize:"clamp(2.4rem,4vw,3.2rem)",
                  letterSpacing:"0.04em", color:"#F5F5F3", lineHeight:1,
                }}>
                  On Quote
                </span>
                <span style={{
                  fontFamily:"var(--font-jetbrains,monospace)",
                  fontSize:"0.58rem", letterSpacing:"0.14em", textTransform:"uppercase",
                  color:"rgba(255,255,255,0.35)",
                }}>
                  per unit
                </span>
              </div>
              <p style={{
                fontFamily:"var(--font-jetbrains,monospace)",
                fontSize:"0.55rem", letterSpacing:"0.1em", textTransform:"uppercase",
                color:"rgba(255,255,255,0.2)",
              }}>
                Personalised quote · Volume discounts available
              </p>
            </div>

            <BrandingPricingTable />
            <div className="h-[1px] w-full" style={{ background: "rgba(255,255,255,0.06)" }} />
            <GiletQuoteFlow productName="Premium Workwear Gilet" />

            <Link href="/products">
              <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase text-muted hover:text-off-white transition-colors duration-200 cursor-pointer">
                ← Back to Products
              </span>
            </Link>

            <div className="lg:hidden">
              <div className="h-[1px] w-full mb-8" style={{ background:"rgba(255,255,255,0.06)" }}/>
              <SpecsTable />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
