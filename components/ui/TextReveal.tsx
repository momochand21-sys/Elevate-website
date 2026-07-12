"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  mode?: "chars" | "words" | "lines";
  once?: boolean;
  viewport?: { once?: boolean; margin?: string };
}

const charVariants: Variants = {
  hidden: { y: "110%", opacity: 0 },
  visible: (i: number) => ({
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.03,
    },
  }),
};

const wordVariants: Variants = {
  hidden: { y: "105%", opacity: 0 },
  visible: (i: number) => ({
    y: "0%",
    opacity: 1,
    transition: {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.06,
    },
  }),
};

export function SplitChars({
  text,
  className,
  delay = 0,
  viewport = { once: true, margin: "-10%" },
}: TextRevealProps) {
  const chars = text.split("");

  return (
    <motion.span
      className={cn("inline-flex flex-wrap", className)}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {chars.map((char, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            variants={charVariants}
            custom={i + delay / 0.03}
          >
            {char === " " ? " " : char}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export function SplitWords({
  text,
  className,
  delay = 0,
  viewport = { once: true, margin: "-10%" },
}: TextRevealProps) {
  const words = text.split(" ");

  return (
    <motion.span
      className={cn("inline-flex flex-wrap gap-x-[0.28em]", className)}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            variants={wordVariants}
            custom={i + delay / 0.06}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export function FadeUp({
  children,
  delay = 0,
  duration = 0.9,
  className,
  viewport = { once: true, margin: "-10%" },
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  viewport?: { once?: boolean; margin?: string };
}) {
  return (
    <motion.div
      className={className}
      initial={{ y: 32, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={viewport}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.8,
  className,
  viewport = { once: true, margin: "-10%" },
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  viewport?: { once?: boolean; margin?: string };
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={viewport}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleReveal({
  children,
  delay = 0,
  className,
  viewport = { once: true, margin: "-10%" },
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  viewport?: { once?: boolean; margin?: string };
}) {
  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ clipPath: "inset(0 0 0% 0)" }}
      viewport={viewport}
      transition={{ duration: 1.0, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
  delay = 0,
  stagger = 0.08,
  viewport = { once: true, margin: "-10%" },
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  viewport?: { once?: boolean; margin?: string };
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { y: 28, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
