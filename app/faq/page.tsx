"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/layout/Footer";

/* ── Size chart data ── */
const SIZE_CHART = [
  { size: "XS",  chest: "34 – 36",  length: "68" },
  { size: "S",   chest: "36 – 38",  length: "70" },
  { size: "M",   chest: "38 – 40",  length: "72" },
  { size: "L",   chest: "42 – 44",  length: "74" },
  { size: "XL",  chest: "46 – 48",  length: "76" },
  { size: "XXL", chest: "50 – 52",  length: "78" },
];

/* ── FAQ data ── */
const FAQS = [
  {
    category: "Ordering & Minimums",
    items: [
      {
        q: "What is the minimum order quantity?",
        a: "Our minimum order is 5 units per product. Every order is placed as a quote request, so we can confirm the best pricing and logistics before anything is finalised.",
      },
      {
        q: "Can I order a mix of products in one order?",
        a: "Yes — you can add multiple different products to your basket (e.g. hoodies, polos, and caps) and submit one combined quote request for everything together.",
      },
      {
        q: "Can I order different sizes in the same order?",
        a: "Absolutely. Each product lets you specify exact quantities per size (XS through XXL). You're not locked into a single size per order.",
      },
      {
        q: "Do you offer samples before I commit to a full order?",
        a: "Yes — contact us at info@elevateworkwear.com to discuss sample options. We recommend ordering a blank sample in your key sizes before a large run to confirm fit for your team.",
      },
      {
        q: "Can I get a discount for large orders?",
        a: "Yes. Volume pricing is built into every quote — the more you order, the lower the per-unit price. Discounts start at 10 units and increase at 25, 50, 100, and 250+ units. For larger contracts, repeat business, or multi-site requirements, we are also happy to discuss bespoke pricing arrangements tailored to your organisation. Please get in touch directly at info@elevateworkwear.com and we will put together a commercial proposal for you.",
      },
    ],
  },
  {
    category: "Sizing",
    items: [
      {
        q: "What sizes do you offer?",
        a: "All garments are available in XS, S, M, L, XL, and XXL. These are standard UK unisex sizes. See the size chart below for exact measurements.",
        hasSizeChart: true,
      },
      {
        q: "How do I choose the right size for my team?",
        a: "Use the chest measurement as your primary guide — measure around the fullest part of the chest and match to the chart below. For workwear worn over other clothing (e.g. a hoodie over a shirt), we recommend sizing up one. If in doubt, order a blank sample first.",
      },
      {
        q: "Do the sizes fit true to size?",
        a: "Yes — all garments are Regular UK Fit, designed to fit true to the standard UK size guide. They are unisex and suitable for both men and women. Female team members typically size down one from their usual size.",
      },
      {
        q: "Can I order the same design in different sizes across the team?",
        a: "Yes — the size selector in the product configurator lets you specify individual quantities per size within a single order, all sharing the same branding specification.",
      },
    ],
  },
  {
    category: "Branding & Logo",
    items: [
      {
        q: "What file format do I need for my logo?",
        a: "For embroidery, the ideal formats are PNG, JPG, SVG, AI, or PDF. We handle the digitisation (converting your logo into an embroidery-ready stitch file) for a one-time fee of £10 on orders under £200 — free on orders over £200. If you already have a DST or PES embroidery file, upload that and no digitising fee applies.",
      },
      {
        q: "Will I be charged for logo digitising every time I order?",
        a: "No — digitising is a one-time charge. Once your logo is digitised and on file, all future orders using the same logo are free. We store your embroidery file so you never pay twice.",
      },
      {
        q: "What branding methods do you offer?",
        a: "We offer embroidery and print. Embroidery is stitched directly into the fabric — durable, professional, and ideal for chest logos and workwear. Print (DTG/screen print) is better for large back prints or complex, multi-colour designs. You can select the method per position when configuring your order.",
      },
      {
        q: "Where can I place my logo?",
        a: "Available positions depend on the garment. Most garments support: Left Chest, Right Chest, Front Centre, Back, Left Shoulder, and Right Shoulder. Gilets (sleeveless) do not have shoulder positions. Caps and beanies support Front Centre only.",
      },
      {
        q: "Can I have a different logo on the front and back?",
        a: "Yes. When configuring your order you can select multiple positions and choose to upload a different logo file for each position, or use the same logo across all positions.",
      },
      {
        q: "What colour will the embroidery thread be?",
        a: "Thread colour is matched to your logo as closely as possible. You can specify exact Pantone or RAL colour references in the order notes, or we'll match from your logo file. We'll always confirm thread colours with you before production begins.",
      },
      {
        q: "Can I see a proof before my order goes into production?",
        a: "Yes. For all branded orders, we send a digital proof of the embroidery or print artwork for your approval before any stitching begins. Production only starts once you've confirmed you're happy.",
      },
    ],
  },
  {
    category: "Production & Delivery",
    items: [
      {
        q: "How long does production take?",
        a: "Standard production is 8 working days from artwork approval. This covers manufacturing, branding, and quality checking — it does not include transit time. Delivery is typically 1–3 working days on top of that, depending on your location in the UK.",
      },
      {
        q: "Do you offer rush / express orders?",
        a: "Contact us before ordering if you have a tight deadline — we can often accommodate urgent requests. Additional charges may apply for expedited production. Email info@elevateworkwear.com with your deadline and we'll advise.",
      },
      {
        q: "Where do you deliver?",
        a: "We deliver to all mainland UK addresses. All orders are sent fully tracked and require a signature on delivery.",
      },
      {
        q: "How will I track my order?",
        a: "Once your order ships, you'll receive a tracking number by email. You can monitor your delivery in real time through the courier's tracking portal. Portal customers can also view order status directly in their account.",
      },
      {
        q: "What if something arrives damaged or incorrect?",
        a: "If a garment arrives damaged, incorrectly branded, or made to the wrong specification due to an error on our part, we'll reprint or replace it at no cost. Contact us within 5 days of receiving your order with photos of the issue, and our team will review the claim and resolve it promptly.",
      },
    ],
  },
  {
    category: "Payment & Pricing",
    items: [
      {
        q: "How does pricing work?",
        a: "Garment pricing is confirmed in your quote and reduces automatically with volume. Branding is charged per position per garment — embroidery on the left chest is £3.50/unit, back embroidery is £5.00/unit, for example. There are no hidden setup fees, and your full itemised total is provided with every quote.",
      },
      {
        q: "What payment methods do you accept?",
        a: "Once your quote is agreed, we'll send a formal invoice payable by bank transfer or card. Payment is confirmed before production begins.",
      },
      {
        q: "Do you offer payment terms for business accounts?",
        a: "We currently require payment upfront for all orders. If you're placing regular large orders and would like to discuss credit terms, contact us at info@elevateworkwear.com.",
      },
      {
        q: "Is there a digitising fee every time I order?",
        a: "No. Logo digitising is a one-time cost of £10 on orders under £200. It's completely free on orders over £200, on all bundles, and on all repeat orders using the same logo.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        q: "What is your returns policy?",
        a: "Because all garments are custom branded to your specification, we cannot accept returns for change of mind. If your order is genuinely incorrect, damaged, or doesn't match the agreed specification due to an error on our part, contact us within 5 days with photos and we'll review the claim, then replace or refund in full where a fault is confirmed. Always check your digital proof carefully before approving production.",
      },

    ],
  },
  {
    category: "Client Portal & Reordering",
    items: [
      {
        q: "What is the client portal?",
        a: "The client portal is a dedicated account area where you can view your previous orders, reorder with a single click, store your logo files, and manage your account details. Contact us to set up a portal account.",
      },
      {
        q: "How does reordering work?",
        a: "In your portal, every previous order has a 'Reorder' button. Clicking it loads all the original products, sizes, quantities, and branding directly into your basket — ready to adjust and submit as a new quote request. No need to start from scratch.",
      },
      {
        q: "Will my logo be on file for future orders?",
        a: "Yes. Once we've digitised your logo, the embroidery file is saved to your account permanently. You'll never pay for digitising again, and reorders take seconds.",
      },
    ],
  },
];

function FAQItem({ q, a, hasSizeChart }: { q: string; a: string; hasSizeChart?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-6 py-5 text-left cursor-pointer"
        style={{ background: "none", border: "none" }}
      >
        <span style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "clamp(0.88rem,1.2vw,0.95rem)", color: open ? "#F5F5F3" : "rgba(255,255,255,0.65)", lineHeight: 1.5, fontWeight: 400 }}>
          {q}
        </span>
        <span style={{ color: "#0041F9", fontSize: "1.1rem", flexShrink: 0, marginTop: 2, transition: "transform 0.25s", display: "block", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingBottom: 20, paddingRight: 32 }}>
              <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>
                {a}
              </p>
              {hasSizeChart && (
                <div className="mt-5 overflow-x-auto">
                  <table style={{ width: "100%", borderCollapse: "collapse", maxWidth: 560 }}>
                    <thead>
                      <tr style={{ background: "rgba(0,65,249,0.1)" }}>
                        {["Size", "Chest (inch)", "Body Length (cm)"].map(h => (
                          <th key={h} style={{ padding: "10px 16px", fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(0,65,249,0.8)", textAlign: "left", borderBottom: "1px solid rgba(0,65,249,0.2)" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SIZE_CHART.map((row, i) => (
                        <tr key={row.size} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                          <td style={{ padding: "10px 16px", fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#F5F5F3", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{row.size}</td>
                          <td style={{ padding: "10px 16px", fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{row.chest}"</td>
                          <td style={{ padding: "10px 16px", fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{row.length} cm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.46rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginTop: 10 }}>
                    Measurements are approximate. Standard UK unisex fit.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <main className="min-h-screen" style={{ background: "#050505" }}>

      {/* Header */}
      <section className="relative overflow-hidden pt-36 pb-14 px-6 md:px-12 max-w-[1400px] mx-auto">
        <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: "rgba(0,65,249,0.7)" }}>
          Got a Question?
        </p>
        <h1 className="text-off-white mb-5" style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "clamp(3rem,7vw,6rem)", letterSpacing: "0.04em", lineHeight: 0.95 }}>
          Frequently Asked<br />
          <span style={{ color: "rgba(255,255,255,0.22)" }}>Questions</span>
        </h1>
        <p className="max-w-xl" style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "clamp(0.875rem,1.4vw,1rem)", color: "rgba(255,255,255,0.38)", lineHeight: 1.7 }}>
          Everything you need to know about ordering branded workwear from Elevate. Can&apos;t find your answer?{" "}
          <a href="mailto:info@elevateworkwear.com" style={{ color: "rgba(0,65,249,0.8)", textDecoration: "none" }}>
            Email us directly
          </a>{" "}
          and we&apos;ll get back to you within 2 hours.
        </p>
        <div className="mt-10 h-[1px] w-32" style={{ background: "linear-gradient(to right, rgba(0,65,249,0.6), transparent)" }}/>
      </section>

      {/* FAQ sections */}
      <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12 items-start">

          {/* Sticky category nav — desktop */}
          <aside className="hidden lg:block sticky" style={{ top: 100 }}>
            <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 16 }}>
              Categories
            </p>
            <nav className="flex flex-col gap-1">
              {FAQS.map(cat => (
                <a key={cat.category} href={`#${cat.category.toLowerCase().replace(/\s+&?\s*/g,"-")}`}
                  style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.85rem", color: "rgba(255,255,255,0.42)", textDecoration: "none", padding: "6px 0", transition: "color 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.42)"; }}>
                  {cat.category}
                </a>
              ))}
            </nav>
            <div style={{ marginTop: 32, padding: "16px", border: "1px solid rgba(0,65,249,0.2)", background: "rgba(0,65,249,0.05)" }}>
              <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,65,249,0.7)", marginBottom: 8 }}>Still have questions?</p>
              <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 12 }}>
                We reply within 2 hours on business days. Response times may be a little longer at weekends, though we aim to get back to you as quickly as possible.
              </p>
              <a href="mailto:info@elevateworkwear.com"
                style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#0041F9", textDecoration: "none" }}>
                info@elevateworkwear.com →
              </a>
            </div>
          </aside>

          {/* Questions */}
          <div className="flex flex-col gap-14">
            {FAQS.map(cat => (
              <div key={cat.category} id={cat.category.toLowerCase().replace(/\s+&?\s*/g,"-")}>
                <div className="flex items-center gap-3 mb-2" style={{ paddingBottom: 12, borderBottom: "2px solid #0041F9", display: "inline-flex" }}>
                  <h2 style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "1.5rem", letterSpacing: "0.05em", color: "#F5F5F3", lineHeight: 1 }}>
                    {cat.category}
                  </h2>
                </div>
                <div style={{ marginTop: 4 }}>
                  {cat.items.map(item => (
                    <FAQItem key={item.q} q={item.q} a={item.a} hasSizeChart={item.hasSizeChart} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </main>
  );
}
