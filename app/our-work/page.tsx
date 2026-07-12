"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/layout/Footer";

/* ─────────────────────────────────────────────────────────────
   CLIENTS / OUR WORK
   Real clients wearing Elevate-supplied branded workwear.
   ───────────────────────────────────────────────────────────── */

interface ClientCase {
  name: string;
  sector: string;
  location: string;
  blurb: string;
  supplied: string[];
  images: { src: string; alt: string }[];
}

const CLIENTS: ClientCase[] = [
  {
    name: "All Clean Express",
    sector: "Car Wash & Valeting",
    location: "Blackburn · Whalley Range",
    blurb:
      "Supplying premium branded workwear to All Clean Express — a busy car wash and detailing operation in Blackburn. Their team works in fully branded embroidered polos and caps that hold up to daily wear, water and grime while keeping the crew looking sharp and professional on every job.",
    supplied: ["Embroidered Polos", "Branded Caps", "Manager Teamwear", "Custom Back Branding"],
    images: [
      { src: "/our-work/allclean-detailing.jpg", alt: "All Clean Express manager detailing a VW Golf R in branded polo" },
      { src: "/our-work/allclean-wash.jpg", alt: "All Clean Express team member pressure-washing an Audi in branded teamwear" },
      { src: "/our-work/allclean-interior.jpg", alt: "All Clean Express valeter cleaning a car interior in branded polo" },
      { src: "/our-work/allclean-boot.jpg", alt: "All Clean Express manager vacuuming a boot in branded workwear" },
    ],
  },
];

function ClientBlock({ client, index }: { client: ClientCase; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div ref={ref} className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
      {/* Client header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(0,65,249,0.85)" }}>
            {String(index + 1).padStart(2, "0")} — Client
          </span>
          <span className="flex-1 h-[1px]" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="text-off-white mb-3" style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "clamp(2.4rem,5vw,4rem)", letterSpacing: "0.03em", lineHeight: 0.92 }}>
              {client.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#C6AA72" }}>
                {client.sector}
              </span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
              <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                {client.location}
              </span>
            </div>
          </div>

          {/* Supplied tags */}
          <div className="flex flex-wrap gap-2 lg:justify-end lg:max-w-[420px]">
            {client.supplied.map((s) => (
              <span key={s} style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)", padding: "6px 11px" }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-6 max-w-[760px]" style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "clamp(0.92rem,1.4vw,1.05rem)", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
          {client.blurb}
        </p>
      </motion.div>

      {/* Image gallery — tall portrait shots in a responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {client.images.map((img, i) => (
          <motion.div
            key={img.src}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden"
            style={{ aspectRatio: "3/4", background: "#0A0A0E", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width:768px) 50vw, 24vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
            {/* Hover gradient + label */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)" }} />
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
              <span style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>
                Elevate Branded Workwear
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function OurWorkPage() {
  return (
    <main className="min-h-screen" style={{ background: "#050505" }}>
      {/* ── Hero header ── */}
      <section className="relative overflow-hidden pt-36 pb-16 md:pt-44 md:pb-20">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,65,249,0.1) 0%, transparent 70%)" }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(0,65,249,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,65,249,0.6) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative max-w-[1400px] mx-auto px-6 md:px-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="font-mono text-[8px] tracking-[0.18em] uppercase transition-colors duration-200 text-white/30 hover:text-white/65">
              Home
            </Link>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.6rem" }}>/</span>
            <span className="font-mono text-[8px] tracking-[0.18em] uppercase" style={{ color: "rgba(0,65,249,0.8)" }}>Our Work</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="section-label mb-6">/ Our Work</div>
            <h1 className="text-off-white mb-6" style={{ fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "clamp(3rem,9vw,8rem)", letterSpacing: "0.02em", lineHeight: 0.88 }}>
              REAL TEAMS,<br /><span className="text-gradient-blue">REAL BRANDING</span>
            </h1>
            <p className="max-w-[560px]" style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "clamp(0.95rem,1.5vw,1.15rem)", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
              From car washes to construction crews — see the businesses across the North West kitted out in Elevate workwear. Branded, durable, and built for the job.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Client cases ── */}
      {CLIENTS.map((client, i) => (
        <ClientBlock key={client.name} client={client} index={i} />
      ))}

      <CTA />
      <Footer />
    </main>
  );
}
