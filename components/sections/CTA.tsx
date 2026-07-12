"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeUp } from "@/components/ui/TextReveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { useQuoteModal } from "@/lib/quote-modal-context";
import BookCallModal from "@/components/sections/BookCallModal";

export default function CTA() {
  const { open } = useQuoteModal();
  const [bookOpen, setBookOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const orbScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.9]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.1, 0.3, 0.1]);

  return (
    <section id="cta" ref={sectionRef} className="relative bg-dark border-t border-border overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(0,65,249,0.18) 0%, transparent 70%)",
            filter: "blur(60px)",
            scale: orbScale,
            opacity: orbOpacity,
          }}
        />
      </div>

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0,65,249,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,65,249,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-40">
        <div className="flex flex-col items-center text-center max-w-[900px] mx-auto">
          <FadeUp>
            <div className="section-label mb-8 justify-center">/ 05 Get Started</div>
          </FadeUp>

          {/* Main heading */}
          <h2
            className="text-off-white leading-[0.88] mb-8"
            style={{
              fontFamily: "var(--font-bebas, 'Bebas Neue')",
              fontSize: "clamp(3.5rem, 10vw, 12rem)",
              letterSpacing: "0.02em",
            }}
          >
            <motion.span
              className="overflow-hidden block"
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              whileInView={{ clipPath: "inset(0 0 0% 0)" }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            >
              READY TO
            </motion.span>
            <motion.span
              className="overflow-hidden block text-gradient-blue"
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              whileInView={{ clipPath: "inset(0 0 0% 0)" }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 1.0, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              ELEVATE?
            </motion.span>
          </h2>

          <FadeUp delay={0.35}>
            <p className="text-muted text-base md:text-lg font-light leading-relaxed mb-12 max-w-[480px]">
              Get a tailored quote in under 5 hours. Tell us what you need, and we&apos;ll handle everything from there — no fuss, no hidden costs.
            </p>
          </FadeUp>

          {/* CTA buttons */}
          <FadeUp delay={0.5} className="flex flex-col sm:flex-row items-center gap-5">
            <MagneticButton
              className="group relative overflow-hidden bg-blue text-white font-mono text-[11px] tracking-[0.16em] uppercase px-10 py-5 flex items-center gap-3"
              strength={30}
              onClick={open}
            >
              <span className="relative z-10">Request a Free Quote</span>
              <svg
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path d="M2 7H12M7 2L12 7L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Shine on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s ease-in-out infinite",
                }}
              />
            </MagneticButton>

            <MagneticButton
              className="font-mono text-[11px] tracking-[0.16em] uppercase text-silver border border-white/10 hover:border-blue/40 hover:text-off-white px-10 py-5 transition-all duration-400 flex items-center gap-3"
              strength={20}
              onClick={() => setBookOpen(true)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1C3.686 1 1 3.686 1 7s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.4" />
                <path d="M7 4v4l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Book a Call</span>
            </MagneticButton>
          </FadeUp>

          <BookCallModal open={bookOpen} onClose={() => setBookOpen(false)} />

          {/* Trust badges */}
          <FadeUp delay={0.7}>
            <div className="mt-14 pt-10 border-t border-border/50 flex flex-col sm:flex-row items-center gap-8">
              {[
                { icon: "⚡", label: "Response within 5 hours" },
                { icon: "🔒", label: "No obligation quote" },
                { icon: "✓", label: "B2B Workwear Specialists" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2">
                  <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-blue">{badge.icon}</span>
                  <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-muted">{badge.label}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
