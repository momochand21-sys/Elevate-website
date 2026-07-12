"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * ElevateLogo — renders the official Elevate Workwear Solutions brand mark
 * from the exact logo file, properly cropped with no white borders.
 *
 * Image: /public/logo/elevate-logo-clean.png (880×360, transparent bg)
 * Intrinsic aspect ratio: 2.44:1 (width:height)
 *
 * Variants:
 *  nav  — 38px tall  (navbar, proportional width ≈ 93px)
 *  full — 180px wide (footer, proportional height ≈ 74px)
 *  hero — 420px wide (hero centred, proportional height ≈ 172px)
 */

type LogoVariant = "nav" | "full" | "hero";

interface ElevateLogoProps {
  variant?: LogoVariant;
  className?: string;
}

const displayStyle: Record<LogoVariant, React.CSSProperties> = {
  nav:  { height: "38px",  width: "auto" },
  full: { width: "180px",  height: "auto" },
  hero: { width: "420px",  height: "auto" },
};

export default function ElevateLogo({
  variant = "nav",
  className,
}: ElevateLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/logo/elevate-logo-clean.png"
        alt="Elevate Workwear Solutions"
        width={880}
        height={360}
        priority={variant === "nav" || variant === "hero"}
        className="object-contain"
        style={displayStyle[variant]}
        draggable={false}
      />
    </div>
  );
}
