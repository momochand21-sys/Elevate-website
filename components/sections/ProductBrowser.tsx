"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useQuoteModal } from "@/lib/quote-modal-context";

/* ─────────────────────────────────────────────────────────────
   PRODUCT BROWSER
   The category image boxes act as tabs. Selecting a category
   shows the products that belong to it below. Made-to-order
   categories (PPE, Hospitality) show a "request a quote" panel.
   ───────────────────────────────────────────────────────────── */

interface Product {
  href: string;
  name: string;
  code: string;
  tagline: string;
  img: string;
  badge: string;
  imgScale: string;      // width/height as a % of the frame
  imgTranslateY?: string;
}

interface Category {
  key: string;
  heading: string;
  items: string;
  image: string;
  fit: "cover" | "contain";
  products: Product[];
  madeToOrder?: boolean;
  note?: string;         // e.g. "T-Shirts available on request"
}

/* ── Product definitions ── */
const POLO: Product        = { href: "/products/polo-shirts/workwear-polo",       name: "Premium Workwear Polo",    code: "ELV-002", tagline: "220gsm · Poly/Cotton Piqué · Unisex",     img: "/products/polo-360/polo-000.png",                 badge: "360° View", imgScale: "85%" };
const QUARTER_ZIP: Product = { href: "/products/quarter-zip/workwear-quarter-zip", name: "Premium Workwear 1/4 Zip", code: "ELV-006", tagline: "Cotton French Terry · Quarter-Zip · Unisex", img: "/products/quarter-zip-360/quarter-zip-000.png",   badge: "360° View", imgScale: "82%" };
const HOODIE: Product      = { href: "/products/hoodies/heavyweight-hoodie",       name: "Premium Workwear Hoodie",  code: "ELV-001", tagline: "430gsm · Embroidered · Unisex",            img: "/products/360/hoodie-000.png",                    badge: "360° View", imgScale: "85%" };
const TSHIRT: Product      = { href: "/products/t-shirts/workwear-tshirt",         name: "Premium Workwear T-Shirt", code: "ELV-011", tagline: "180gsm · Cotton Blend · Unisex",           img: "/products/tshirt-360/tshirt-000.png",             badge: "360° View", imgScale: "85%" };
const BEANIE: Product      = { href: "/products/caps-beanies/workwear-beanie",     name: "Premium Workwear Beanie",  code: "ELV-003", tagline: "Ribbed Cuff · Acrylic Knit · One Size",    img: "/products/beanie-360/beanie-000.png",             badge: "360° View", imgScale: "62%", imgTranslateY: "12%" };
const CAP: Product         = { href: "/products/caps-beanies/workwear-cap",        name: "Premium Workwear Cap",     code: "ELV-004", tagline: "6-Panel · Cotton Twill · Adjustable",      img: "/products/cap-360/cap-000.png",                   badge: "360° View", imgScale: "62%", imgTranslateY: "12%" };
const GILET: Product       = { href: "/products/gilets/workwear-gilet",            name: "Premium Workwear Gilet",   code: "ELV-005", tagline: "Quilted · Sleeveless · Full-Zip",          img: "/products/gilet-360/gilet-front-final-v3.png",    badge: "360° View", imgScale: "75%" };
const PADDED_GILET: Product = { href: "/products/gilets/padded-gilet",             name: "Padded Bodywarmer Gilet",  code: "ELV-012", tagline: "Padded · Sleeveless · Full-Zip",           img: "/products/padded-gilet-360/padded-gilet-000.png", badge: "360° View", imgScale: "80%" };
const HI_VIS_JACKET: Product = { href: "/products/ppe/hi-vis-jacket",               name: "Hi-Vis Padded Jacket",     code: "ELV-007", tagline: "Hi-Vis Yellow · Reflective · Padded",      img: "/products/hi-vis-360/hi-vis-000.png",             badge: "360° View", imgScale: "88%" };
const HI_VIS_VEST: Product   = { href: "/products/ppe/hi-vis-vest",                 name: "Hi-Vis Safety Vest",       code: "ELV-008", tagline: "Hi-Vis Yellow · Reflective · Lightweight", img: "/products/hi-vis-vest-360/hi-vis-vest-000.png",   badge: "360° View", imgScale: "88%" };
const PANTS: Product         = { href: "/products/ppe/workwear-pants",              name: "Workwear Cargo Pants",     code: "ELV-013", tagline: "Ripstop · Cargo Pockets · Reinforced Knee", img: "/products/pants-360/pants-000.png",              badge: "360° View", imgScale: "82%" };
const APRON: Product         = { href: "/products/hospitality/apron",              name: "Workwear Apron",           code: "ELV-009", tagline: "Poly/Cotton · Pocket Front · Adjustable",  img: "/products/apron/apron-000.png",                   badge: "Front View", imgScale: "80%" };
const TABARD: Product        = { href: "/products/hospitality/tabard",             name: "Workwear Tabard",          code: "ELV-010", tagline: "Lightweight · Side Ties · Unisex",        img: "/products/tabard/tabard-000.png",                 badge: "Front View", imgScale: "88%" };

const CATEGORIES: Category[] = [
  { key: "corporate",   heading: "Corporate Wear",    items: "Polo Shirts · 1/4 Zips",     image: "/products/categories/corporate.jpg",                     fit: "cover", products: [POLO, QUARTER_ZIP], madeToOrder: true, note: "More corporate styles made to order" },
  { key: "casual",      heading: "Casualwear",        items: "Hoodies · T-Shirts",         image: "/products/categories/casual.jpg",                   fit: "cover", products: [HOODIE, TSHIRT], madeToOrder: true, note: "More casualwear styles made to order" },
  { key: "headwear",    heading: "Headwear",          items: "Caps · Beanies",             image: "/products/categories/headwear.jpg",                      fit: "cover", products: [BEANIE, CAP], madeToOrder: true, note: "More headwear styles made to order" },
  { key: "outerwear",   heading: "Outerwear",         items: "Gilets · Bodywarmers",       image: "/products/categories/outerwear.jpg", fit: "cover", products: [GILET, PADDED_GILET], madeToOrder: true, note: "More outerwear styles made to order" },
  { key: "ppe",         heading: "PPE & Safety Wear", items: "Hi-Vis · Workwear Trousers", image: "/products/categories/ppe.jpg",                 fit: "cover", products: [HI_VIS_JACKET, HI_VIS_VEST, PANTS], madeToOrder: true, note: "More PPE & safety styles made to order" },
  { key: "hospitality", heading: "Hospitality Wear",  items: "Aprons · Tabards",           image: "/products/categories/hospitality.jpg",         fit: "cover", products: [APRON, TABARD], madeToOrder: true, note: "More hospitality styles made to order" },
];

/* map navbar deep-link hashes onto category tabs */
const HASH_TO_KEY: Record<string, string> = {
  "hoodies": "casual", "t-shirts": "casual",
  "polo-shirts": "corporate", "quarter-zip": "corporate",
  "caps-beanies": "headwear", "gilets": "outerwear",
  "corporate": "corporate", "casual": "casual",
  "headwear": "headwear", "outerwear": "outerwear",
  "ppe": "ppe", "hospitality": "hospitality",
};

/* ── Single product card ── */
function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={p.href} className="group block">
      <div
        style={{ background: "rgba(10,10,14,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}
        className="group-hover:border-blue/40 transition-all duration-300 overflow-hidden flex flex-col"
      >
        <div className="relative bg-[#0A0A0E] flex items-center justify-center overflow-hidden" style={{ aspectRatio: "4/5" }}>
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,65,249,0.07) 0%, transparent 68%)" }} />
          <Image src={p.img} alt={p.name} width={700} height={470}
            className="relative z-10 transition-transform duration-500 group-hover:scale-105"
            style={{ width: p.imgScale, height: p.imgScale, objectFit: "contain", filter: "brightness(1.05)", transform: p.imgTranslateY ? `translateY(${p.imgTranslateY})` : undefined }}
            sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 22vw" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5"
            style={{ background: "rgba(4,4,8,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,65,249,0.3)", padding: "3px 8px" }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#0041F9", boxShadow: "0 0 6px rgba(0,65,249,0.8)" }} />
            <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.45rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(180,190,220,0.75)" }}>{p.badge}</span>
          </div>
          <div className="absolute bottom-3 right-3 w-7 h-7 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            style={{ background: "rgba(0,65,249,0.15)", borderColor: "rgba(0,65,249,0.4)" }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5h6M5 2l3 3-3 3" stroke="#0041F9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-1">
          <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(0,65,249,0.55)" }}>{p.code}</p>
          <h3 className="text-off-white leading-tight" style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "1.05rem", letterSpacing: "0.04em" }}>{p.name}</h3>
          <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.48rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>{p.tagline}</p>
        </div>
        <div className="mx-4 mb-4 h-[1px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-400"
          style={{ background: "linear-gradient(to right, #0041F9, transparent)" }} />
      </div>
    </Link>
  );
}

/* ── Category tab (image box) ── */
function TabBox({ cat, active, onClick }: { cat: Category; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative block overflow-hidden cursor-pointer w-full text-left"
      style={{
        aspectRatio: "4/5",
        border: active ? "1px solid #0041F9" : "1px solid rgba(255,255,255,0.08)",
        background: "#0A0A0E",
        boxShadow: active ? "0 0 0 1px #0041F9, 0 0 30px rgba(0,65,249,0.25)" : "none",
        transition: "border-color 0.25s, box-shadow 0.25s",
      }}
      aria-pressed={active}
    >
      <div className="absolute inset-0" style={{ background: "#0A0A0E" }}>
        {cat.fit === "contain" && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,65,249,0.14) 0%, transparent 70%)" }} />
        )}
        <Image src={cat.image} alt={cat.heading} fill sizes="(max-width:768px) 50vw, 33vw"
          className={`transition-transform duration-700 group-hover:scale-[1.06] ${cat.fit === "contain" ? "object-contain p-8" : "object-cover"}`}
          style={cat.fit === "cover" ? { filter: active ? "brightness(1)" : "brightness(0.85)" } : undefined} />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)" }} />

      {cat.madeToOrder && (
        <div className="absolute top-3 left-3 z-20"
          style={{ background: "rgba(198,170,114,0.14)", border: "1px solid rgba(198,170,114,0.5)", padding: "4px 10px" }}>
          <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.46rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#C6AA72" }}>Made To Order</span>
        </div>
      )}

      {/* active tick */}
      {active && (
        <div className="absolute top-3 right-3 z-20 flex items-center justify-center rounded-full"
          style={{ width: 22, height: 22, background: "#0041F9" }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.2L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 p-5 md:p-6">
        <h3 className="text-off-white mb-1.5"
          style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "clamp(1.5rem,2.4vw,2.1rem)", letterSpacing: "0.03em", lineHeight: 0.95 }}>
          {cat.heading}
        </h3>
        <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.56rem", letterSpacing: "0.12em", textTransform: "uppercase", color: active ? "rgba(120,160,255,0.95)" : "rgba(255,255,255,0.62)" }}>
          {cat.items}
        </span>
      </div>
    </button>
  );
}

export default function ProductBrowser() {
  const [active, setActive] = useState("corporate");
  const { open: openQuote } = useQuoteModal();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  /* honour navbar deep-links like /products#polo-shirts */
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace("#", "");
      if (HASH_TO_KEY[h]) setActive(HASH_TO_KEY[h]);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const cat = CATEGORIES.find(c => c.key === active) ?? CATEGORIES[0];

  return (
    <section ref={ref} className="px-6 md:px-12 max-w-[1400px] mx-auto pb-20">
      {/* Heading */}
      <div className="flex items-center gap-2 mb-5">
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0041F9", boxShadow: "0 0 8px rgba(0,65,249,0.9)" }} />
        <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(200,208,228,0.8)" }}>
          Shop By Category
        </p>
      </div>

      {/* Category tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {CATEGORIES.map((c, i) => (
          <motion.div key={c.key}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <TabBox cat={c} active={active === c.key} onClick={() => setActive(c.key)} />
          </motion.div>
        ))}
      </div>

      {/* Active category panel */}
      <div className="mt-12" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "2.5rem" }}>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <h2 className="text-off-white" style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "clamp(1.8rem,3.4vw,2.8rem)", letterSpacing: "0.03em", lineHeight: 0.95 }}>
            {cat.heading}
          </h2>
          <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#C6AA72" }}>
            {cat.items}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={cat.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {cat.products.map(p => <ProductCard key={p.href} p={p} />)}
            </div>

            {/* Made-to-order strip — every category */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 px-6 py-5"
              style={{ border: "1px solid rgba(0,65,249,0.22)", background: "rgba(0,65,249,0.04)" }}>
              <div className="flex items-center gap-2.5">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C6AA72", boxShadow: "0 0 6px rgba(198,170,114,0.7)" }} />
                <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
                  {cat.note}
                </span>
              </div>
              <button onClick={openQuote}
                className="group flex-shrink-0 flex items-center gap-2.5 bg-blue text-white px-6 py-3 cursor-pointer"
                style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Specialised Requests
                <svg className="transition-transform duration-300 group-hover:translate-x-1" width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7H12M7 2L12 7L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
