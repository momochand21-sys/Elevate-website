"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/TextReveal";
import { SplitWords } from "@/components/ui/TextReveal";

const services = [
  {
    number: "01",
    title: "Bulk Supply",
    short: "Volume workwear for teams of any size — delivered fast, priced right.",
    description:
      "We source premium workwear at scale. From 10 to 10,000 units, our supply chain delivers consistently — without the wait or the premium price tag.",
    tags: ["Fast Turnaround", "Flexible MOQ", "Pan-UK Delivery"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="8" width="24" height="18" rx="2" />
        <path d="M18 8V6a4 4 0 00-8 0v2" />
        <path d="M14 14v4M12 16h4" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Custom Branding",
    short: "Your identity, stitched and printed to perfection on every garment.",
    description:
      "Logo embroidery, screen printing, heat transfer — we make your brand live on every thread. Premium finish, durable result. Your workwear becomes your billboard.",
    tags: ["Embroidery", "Screen Print", "Heat Transfer"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h4M6 14l2-2 4 4 6-7 2 2" />
        <circle cx="14" cy="14" r="12" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Corporate Kits",
    short: "Complete uniform packages — from head to toe — for professional teams.",
    description:
      "Build a complete corporate identity. We design, supply, and kit out entire teams with coordinated, branded workwear that creates immediate presence and professionalism.",
    tags: ["Design Consultation", "Full Kit Solution", "Ongoing Restocking"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 4H6a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-4" />
        <rect x="10" y="2" width="8" height="5" rx="1" />
        <path d="M10 12h8M10 16h5" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "PPE Supply",
    short: "Safety-certified protective equipment that meets and exceeds industry standards.",
    description:
      "We supply CE-marked, safety-rated PPE for construction, manufacturing, and hazardous environments. Quality you can trust, compliance you can prove.",
    tags: ["CE Certified", "Construction Grade", "Healthcare Ready"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3L4 7v8c0 5 4.4 9 10 9s10-4 10-9V7L14 3z" />
        <path d="M10 14l2.5 2.5L18 11" />
      </svg>
    ),
  },
  {
    number: "05",
    title: "Account Management",
    short: "A dedicated account manager who knows your business — always on call.",
    description:
      "No call centres, no bots. Every Elevate client gets a real account manager who manages restocking, new requirements, and quality control personally.",
    tags: ["Dedicated Manager", "24hr Response", "Reorder System"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="9" r="5" />
        <path d="M4 24c0-5.523 4.477-9 10-9s10 3.477 10 9" />
      </svg>
    ),
  },
  {
    number: "06",
    title: "Express Delivery",
    short: "When time matters — priority fulfilment and expedited nationwide delivery.",
    description:
      "Where possible, we prioritise urgent orders to reduce lead times. All deliveries are fully tracked from dispatch to doorstep across the UK.",
    tags: ["Priority Fulfilment", "Tracked Delivery", "Pan-UK Coverage"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-4l-3-4H5a2 2 0 00-2 2v12a2 2 0 002 2h2" />
        <path d="M16 7l4 12H7" />
        <circle cx="9" cy="23" r="2" />
        <circle cx="20" cy="23" r="2" />
      </svg>
    ),
  },
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    setTilt({ x: -y, y: x });
  };

  return (
    <motion.div
      ref={cardRef}
      variants={{
        hidden: { y: 40, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      style={{
        transform: hovered
          ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(8px)`
          : "perspective(800px) rotateX(0) rotateY(0) translateZ(0)",
        transition: hovered ? "transform 0.1s ease" : "transform 0.5s ease",
      }}
      className="relative group bg-surface border border-border hover:border-blue/30 transition-colors duration-500 p-8 noise-overlay cursor-pointer overflow-hidden"
      data-cursor="hover"
    >
      {/* Hover background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(0,65,249,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Blue top border reveal */}
      <div className="absolute top-0 left-0 h-[2px] bg-blue w-0 group-hover:w-full transition-all duration-600 ease-expo" />

      {/* Number */}
      <span
        className="absolute top-6 right-6 text-border/40 group-hover:text-blue/10 transition-colors duration-500 select-none pointer-events-none"
        style={{
          fontFamily: "var(--font-bebas, 'Bebas Neue')",
          fontSize: "4.5rem",
          lineHeight: 1,
          letterSpacing: "0.04em",
        }}
      >
        {service.number}
      </span>

      {/* Icon */}
      <div className="w-12 h-12 border border-border group-hover:border-blue/30 flex items-center justify-center text-muted group-hover:text-blue transition-all duration-500 mb-6">
        {service.icon}
      </div>

      {/* Title */}
      <h3
        className="text-off-white mb-3 transition-colors duration-300"
        style={{
          fontFamily: "var(--font-bebas, 'Bebas Neue')",
          fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)",
          letterSpacing: "0.03em",
          lineHeight: 1,
        }}
      >
        {service.title}
      </h3>

      {/* Short desc */}
      <p className="text-muted text-sm font-light leading-relaxed mb-5 transition-colors duration-300 group-hover:text-silver">
        {service.short}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-auto">
        {service.tags.map((tag) => (
          <span
            key={tag}
            className="font-mono text-[8px] tracking-[0.14em] uppercase text-muted border border-border group-hover:border-blue/20 group-hover:text-blue/70 px-2.5 py-1 transition-all duration-400"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Arrow */}
      <div className="absolute bottom-6 right-6 w-7 h-7 border border-border group-hover:border-blue/40 flex items-center justify-center text-muted group-hover:text-blue transition-all duration-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 10L10 2M2 2H10V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>
  );
}

export default function Services() {
  return (
    <section id="services" className="relative bg-black border-t border-border overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Ambient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] orb orb-blue opacity-[0.06] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-36">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
          <div>
            <FadeUp>
              <div className="section-label mb-8">/ 02 Services</div>
            </FadeUp>
            <h2
              className="text-off-white leading-[0.9]"
              style={{
                fontFamily: "var(--font-bebas, 'Bebas Neue')",
                fontSize: "clamp(3rem, 8vw, 9rem)",
                letterSpacing: "0.02em",
              }}
            >
              <span className="overflow-hidden block">
                <SplitWords text="WHAT WE" />
              </span>
              <span className="overflow-hidden block text-gradient-blue">
                <SplitWords text="DELIVER" delay={0.1} />
              </span>
            </h2>
          </div>
          <FadeUp delay={0.2} className="md:max-w-[320px]">
            <p className="text-muted text-base font-light leading-relaxed">
              End-to-end workwear solutions for every industry. From the first consultation to the final delivery.
            </p>
          </FadeUp>
        </div>

        {/* Services grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-5%" }}
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
            hidden: {},
          }}
        >
          {services.map((service, i) => (
            <ServiceCard key={service.number} service={service} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
