"use client";

import { useRef, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  href?: string;
  as?: "button" | "a";
  type?: "button" | "submit";
}

export default function MagneticButton({
  children,
  className,
  strength = 30,
  onClick,
  href,
  as: Tag = "button",
  type = "button",
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * (strength / 100);
    const deltaY = (e.clientY - centerY) * (strength / 100);
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const props = {
    ref: ref as React.Ref<HTMLButtonElement>,
    className: cn("magnetic-btn cursor-pointer", className),
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onClick,
    ...(Tag === "a" ? { href } : { type }),
  };

  return (
    <motion.button
      {...(props as React.ComponentPropsWithRef<typeof motion.button>)}
      style={{ x: springX, y: springY }}
      className={cn("magnetic-btn cursor-pointer", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
