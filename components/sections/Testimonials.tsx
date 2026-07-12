"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { FadeUp, SplitWords } from "@/components/ui/TextReveal";

const testimonials = [
  {
    quote:
      "Elevate transformed how our team presents itself on-site. The quality is exceptional — our workwear has become a genuine brand asset. Every client notices.",
    author: "Marcus Reynolds",
    role: "Operations Director",
    company: "Reynolds Construction Group",
    industry: "Construction",
    result: "40% boost in team confidence ratings",
    avatar: "MR",
  },
  {
    quote:
      "We outfitted 200 logistics staff in under two weeks. The branding was spot-on, the delivery was flawless, and the quality has held up through 12 months of daily use.",
    author: "Sarah Chen",
    role: "HR Manager",
    company: "NorthFlow Logistics",
    industry: "Logistics",
    result: "200 staff kitted in 11 days",
    avatar: "SC",
  },
  {
    quote:
      "The level of service from Elevate is unlike any supplier we've used before. A dedicated account manager, zero mistakes, and the best-looking uniforms in our sector.",
    author: "James Whitfield",
    role: "Founder & CEO",
    company: "Whitfield Facilities",
    industry: "Facilities Management",
    result: "3-year supply partnership",
    avatar: "JW",
  },
  {
    quote:
      "From concept to delivery in 9 days. Their embroidery quality is outstanding — our logo looks better on their garments than on any previous supplier we've used.",
    author: "Priya Sharma",
    role: "Brand Manager",
    company: "Apex Healthcare Services",
    industry: "Healthcare",
    result: "600 branded units delivered",
    avatar: "PS",
  },
  {
    quote:
      "Premium product, transparent pricing, and a team that actually cares. Elevate made the whole process effortless. We won't go anywhere else.",
    author: "Daniel O'Brien",
    role: "MD",
    company: "O'Brien Security Solutions",
    industry: "Security",
    result: "98% reorder rate maintained",
    avatar: "DO",
  },
];

function StarRating() {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="#C6AA72">
          <polygon points="6,1 7.5,4.5 11.5,4.5 8.5,7 9.5,11 6,9 2.5,11 3.5,7 0.5,4.5 4.5,4.5" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const bgX = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);

  const prev = () => setActive((a) => (a === 0 ? testimonials.length - 1 : a - 1));
  const next = () => setActive((a) => (a === testimonials.length - 1 ? 0 : a + 1));

  const t = testimonials[active];

  return (
    <section id="results" className="relative bg-surface border-t border-border overflow-hidden" ref={containerRef}>
      {/* Animated background text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none"
        style={{ x: bgX }}
      >
        <span
          className="text-border/20 whitespace-nowrap"
          style={{
            fontFamily: "var(--font-bebas, 'Bebas Neue')",
            fontSize: "clamp(8rem, 25vw, 28rem)",
            letterSpacing: "0.08em",
            lineHeight: 1,
          }}
        >
          RESULTS
        </span>
      </motion.div>

      {/* Orb */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] orb orb-blue opacity-[0.08] pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-36">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
          <div>
            <FadeUp>
              <div className="section-label mb-8">/ 03 Results</div>
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
                <SplitWords text="WHAT OUR" />
              </span>
              <span className="overflow-hidden block text-gradient-blue">
                <SplitWords text="CLIENTS SAY" delay={0.1} />
              </span>
            </h2>
          </div>
          <FadeUp delay={0.2}>
            <div className="flex items-center gap-3">
              <StarRating />
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
                5.0 / 5.0 · 143 Reviews
              </span>
            </div>
          </FadeUp>
        </div>

        {/* Main testimonial display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left — large quote */}
          <div className="lg:col-span-8">
            <div className="relative glass border border-border/50 p-8 md:p-12 overflow-hidden noise-overlay">
              {/* Quote mark */}
              <div
                className="absolute -top-6 -left-2 text-blue/08 pointer-events-none select-none leading-none"
                style={{ fontFamily: "Georgia, serif", fontSize: "180px", lineHeight: 1 }}
              >
                &ldquo;
              </div>

              <div className="relative z-10">
                <StarRating />

                <AnimatePresence mode="wait">
                  <motion.blockquote
                    key={active}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-off-white mt-6 mb-8 leading-relaxed"
                    style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)", fontWeight: 300 }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </motion.blockquote>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`author-${active}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-4 pt-6 border-t border-border"
                  >
                    <div className="w-11 h-11 bg-blue flex items-center justify-center flex-shrink-0">
                      <span className="font-mono text-xs text-white font-medium tracking-wide">{t.avatar}</span>
                    </div>
                    <div>
                      <p className="text-off-white text-sm font-medium">{t.author}</p>
                      <p className="text-muted text-xs font-light">{t.role} · {t.company}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-blue border border-blue/30 px-2.5 py-1">
                        {t.industry}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-6 mt-6">
              <button
                onClick={prev}
                className="w-10 h-10 border border-border hover:border-blue/40 flex items-center justify-center text-muted hover:text-blue transition-all duration-300 cursor-pointer"
                aria-label="Previous testimonial"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 2L4 8L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`h-[2px] transition-all duration-500 cursor-pointer ${i === active ? "w-8 bg-blue" : "w-3 bg-border hover:bg-muted"}`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-10 h-10 border border-border hover:border-blue/40 flex items-center justify-center text-muted hover:text-blue transition-all duration-300 cursor-pointer"
                aria-label="Next testimonial"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 2L12 8L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-muted ml-2">
                {String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Right — result highlight + mini cards */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Key result */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`result-${active}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.4 }}
                className="glass-blue border border-blue/15 p-6"
              >
                <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-blue mb-2">Key Result</p>
                <p className="text-off-white text-lg font-light">{t.result}</p>
              </motion.div>
            </AnimatePresence>

            {/* Other testimonials mini-list */}
            <div className="flex flex-col gap-2">
              {testimonials
                .filter((_, i) => i !== active)
                .slice(0, 3)
                .map((tt) => (
                  <button
                    key={tt.author}
                    onClick={() => setActive(testimonials.indexOf(tt))}
                    className="glass border border-border/50 hover:border-blue/20 p-4 text-left transition-all duration-300 cursor-pointer group"
                  >
                    <p className="text-silver text-xs font-light leading-relaxed line-clamp-2 group-hover:text-off-white transition-colors duration-200">
                      &ldquo;{tt.quote.substring(0, 80)}...&rdquo;
                    </p>
                    <p className="font-mono text-[8px] tracking-[0.12em] uppercase text-muted mt-2">
                      {tt.author} · {tt.company}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
