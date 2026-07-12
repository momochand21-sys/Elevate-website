"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FadeUp, SplitWords, StaggerContainer, StaggerItem } from "@/components/ui/TextReveal";

function AnimatedCounter({ end, suffix = "", prefix = "", duration = 2000 }: { end: number; suffix?: string; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(end);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration]);

  return <span ref={ref} className="stat-number">{prefix}{count}{suffix}</span>;
}

const stats = [
  { value: 5,  suffix: "+",    label: "Products Available"       },
  { value: 0,  suffix: "",      label: "Hidden Fees"               },
  { value: 100, suffix: "%",   label: "Quality Guaranteed"        },
  { value: 2,  suffix: " hrs", prefix: "< ", label: "Quote Response" },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="about" ref={sectionRef} className="relative bg-dark border-t border-border overflow-hidden">
      {/* Ambient light */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] orb orb-blue opacity-[0.07] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — text */}
          <div>
            <FadeUp>
              <div className="section-label mb-8">/ 01 About</div>
            </FadeUp>

            <h2
              className="text-off-white mb-8 leading-[0.9]"
              style={{
                fontFamily: "var(--font-bebas, 'Bebas Neue')",
                fontSize: "clamp(3rem, 7vw, 7.5rem)",
                letterSpacing: "0.02em",
              }}
            >
              <span className="overflow-hidden block">
                <SplitWords text="WE DON'T" viewport={{ once: true, margin: "-10%" }} />
              </span>
              <span className="overflow-hidden block">
                <SplitWords text="JUST SUPPLY" viewport={{ once: true, margin: "-10%" }} delay={0.1} />
              </span>
              <span className="overflow-hidden block text-gradient-blue">
                <SplitWords text="WORKWEAR." viewport={{ once: true, margin: "-10%" }} delay={0.2} />
              </span>
            </h2>

            <FadeUp delay={0.3}>
              <p className="text-muted text-base md:text-lg font-light leading-relaxed mb-5 max-w-[480px]">
                Elevate is a premium B2B workwear brand built for businesses that understand the power of first impressions. We supply, brand, and deliver high-performance workwear that makes your team look and feel elite.
              </p>
              <p className="text-muted text-base font-light leading-relaxed max-w-[480px]">
                From construction to corporate, we supply premium branded garments that last — built to represent your business with pride, every single day.
              </p>
            </FadeUp>

            <FadeUp delay={0.45}>
              <div className="mt-10 flex items-center gap-8">
                <a
                  href="#services"
                  onClick={(e) => { e.preventDefault(); document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="group flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] uppercase text-off-white hover:text-blue transition-colors duration-300 cursor-pointer"
                >
                  <span>Our Services</span>
                  <span className="w-10 h-[1px] bg-off-white group-hover:bg-blue group-hover:w-14 transition-all duration-400" />
                </a>
              </div>
            </FadeUp>
          </div>

          {/* Right — stats + visual */}
          <div className="flex flex-col gap-8">
            {/* Stats grid */}
            <StaggerContainer
              className="grid grid-cols-2 gap-4"
              stagger={0.1}
              viewport={{ once: true, margin: "-10%" }}
            >
              {stats.map((s) => (
                <StaggerItem key={s.label}>
                  <div className="glass border border-border/50 p-6 md:p-8 noise-overlay relative">
                    <div
                      className="text-off-white mb-1"
                      style={{
                        fontFamily: "var(--font-bebas, 'Bebas Neue')",
                        fontSize: "clamp(2.2rem, 5vw, 4rem)",
                        lineHeight: 1,
                        letterSpacing: "0.02em",
                      }}
                    >
                      <AnimatedCounter end={s.value} suffix={s.suffix} prefix={(s as {prefix?:string}).prefix ?? ""} />
                    </div>
                    <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-muted">
                      {s.label}
                    </p>
                    {/* Blue accent corner */}
                    <div className="absolute top-0 left-0 w-8 h-[2px] bg-blue" />
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Visual card */}
            <motion.div
              className="relative overflow-hidden glass border border-border/50"

            >
              <div className="aspect-[16/9] relative flex items-center justify-center bg-surface overflow-hidden">
                {/* Abstract visual — geometric pattern representing workwear/precision */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: "linear-gradient(rgba(0,65,249,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,65,249,0.4) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                  }} />
                </div>

                {/* Large ELEVATE text behind */}
                <div
                  className="absolute text-blue/[0.04] select-none pointer-events-none"
                  style={{
                    fontFamily: "var(--font-bebas, 'Bebas Neue')",
                    fontSize: "clamp(4rem, 14vw, 11rem)",
                    letterSpacing: "0.08em",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  ELEVATE
                </div>

                {/* Center floating badge */}
                <motion.div
                  className="relative z-10 flex flex-col items-center justify-center gap-4"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
                >
                  <div className="w-16 h-16 bg-blue flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M8 24L16 10L24 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M11 20H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted">Premium Grade</p>
                    <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-off-white mt-0.5">Workwear Standard</p>
                  </div>
                </motion.div>
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-muted">Est. 2020</span>
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill="#C6AA72">
                      <polygon points="5,1 6.5,4 10,4.5 7.5,6.5 8,10 5,8 2,10 2.5,6.5 0,4.5 3.5,4" />
                    </svg>
                  ))}
                  <span className="font-mono text-[8px] tracking-[0.1em] text-muted ml-1">5.0 / 5.0</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
