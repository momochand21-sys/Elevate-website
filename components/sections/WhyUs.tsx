"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp, SplitWords, StaggerContainer, StaggerItem } from "@/components/ui/TextReveal";

const reasons = [
  {
    number: "01",
    title: "Premium Quality, Every Time",
    body: "We work only with ISO-certified manufacturers. Every garment is quality-checked before it leaves our warehouse — no shortcuts, no compromises. Genuine manufacturing faults are reprinted or replaced at zero cost.",
    metric: "100%",
    metricLabel: "Quality checked",
  },
  {
    number: "02",
    title: "Dedicated Account Managers",
    body: "You'll always speak to a real person who knows your account. No call queues, no scripts. Your account manager handles every order, every query, every change request personally.",
    metric: "< 2hr",
    metricLabel: "Average response time",
  },
  {
    number: "03",
    title: "Reliable Nationwide Delivery",
    body: "Standard orders are typically fulfilled and delivered within a few weeks of artwork approval — fully tracked, signed for, and delivered to your door across the UK.",
    metric: "UK",
    metricLabel: "Nationwide delivery",
  },
  {
    number: "04",
    title: "Flexible Minimum Orders",
    body: "Whether you need 5 uniforms for a new team or 5,000 for a national rollout — we scale with you. No rigid minimums, no volume discrimination.",
    metric: "5+",
    metricLabel: "Minimum order",
  },
  {
    number: "05",
    title: "Transparent Pricing",
    body: "No hidden fees. No surprise costs at checkout. Our pricing is clear from first quote to final invoice. Volume discounts are automatic and clearly stated.",
    metric: "0",
    metricLabel: "Hidden fees",
  },
];

const industries = [
  "Construction", "Logistics", "Healthcare", "Facilities",
  "Hospitality", "Security", "Manufacturing", "Retail",
  "Corporate", "Education",
];

export default function WhyUs() {
  const [expanded, setExpanded] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="why-us" ref={sectionRef} className="relative bg-black border-t border-border overflow-hidden">
      {/* Ambient */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] orb orb-blue opacity-[0.06] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Left */}
          <div>
            <FadeUp>
              <div className="section-label mb-8">/ 03 Why Elevate</div>
            </FadeUp>

            <h2
              className="text-off-white leading-[0.9] mb-8"
              style={{
                fontFamily: "var(--font-bebas, 'Bebas Neue')",
                fontSize: "clamp(3rem, 7vw, 8rem)",
                letterSpacing: "0.02em",
              }}
            >
              <span className="overflow-hidden block">
                <SplitWords text="WHY CHOOSE" />
              </span>
              <span className="overflow-hidden block text-gradient-blue">
                <SplitWords text="ELEVATE" delay={0.1} />
              </span>
            </h2>

            <FadeUp delay={0.3}>
              <p className="text-muted text-base font-light leading-relaxed mb-10 max-w-[420px]">
                Built for businesses that take their brand seriously. Premium quality, fast turnaround, and a team that treats every order like it matters — because it does.
              </p>
            </FadeUp>

            {/* Industries grid */}
            <FadeUp delay={0.4}>
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-blue mb-4">
                Industries We Serve
              </p>
              <div className="flex flex-wrap gap-2">
                {industries.map((ind) => (
                  <span
                    key={ind}
                    className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted border border-border hover:border-blue/30 hover:text-blue/70 px-3 py-1.5 transition-all duration-300 cursor-default"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* Right — expandable reasons */}
          <div className="relative">
            {/* Animated vertical line */}
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-border overflow-hidden">
              <div className="w-full bg-blue" style={{ height: "40%" }} />
            </div>

            <div className="pl-8 flex flex-col">
              {reasons.map((reason, i) => {
                const isOpen = expanded === i;
                return (
                  <div key={reason.number} className="border-b border-border last:border-0">
                    <button
                      onClick={() => setExpanded(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-4 py-6 text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-5">
                        <span className="font-mono text-[9px] tracking-[0.18em] text-blue w-6 flex-shrink-0">
                          {reason.number}
                        </span>
                        <h3
                          className={`transition-colors duration-300 ${isOpen ? "text-off-white" : "text-silver group-hover:text-off-white"}`}
                          style={{
                            fontFamily: "var(--font-bebas, 'Bebas Neue')",
                            fontSize: "clamp(1.2rem, 2.2vw, 1.8rem)",
                            letterSpacing: "0.03em",
                            lineHeight: 1.1,
                          }}
                        >
                          {reason.title}
                        </h3>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="w-7 h-7 border border-border group-hover:border-blue/40 flex items-center justify-center text-muted group-hover:text-blue flex-shrink-0 transition-all duration-300"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pb-6 flex flex-col md:flex-row gap-6">
                            <p className="text-muted text-sm font-light leading-relaxed flex-1">
                              {reason.body}
                            </p>
                            <div className="glass-blue border border-blue/15 p-5 min-w-[120px] flex flex-col items-center justify-center flex-shrink-0">
                              <span
                                className="text-off-white"
                                style={{
                                  fontFamily: "var(--font-bebas, 'Bebas Neue')",
                                  fontSize: "2.5rem",
                                  lineHeight: 1,
                                  letterSpacing: "0.04em",
                                }}
                              >
                                {reason.metric}
                              </span>
                              <span className="font-mono text-[8px] tracking-[0.16em] uppercase text-blue mt-1 text-center">
                                {reason.metricLabel}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
