"use client";

import { createContext, useContext, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface LenisContextType {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextType>({ lenis: null });

export function useLenis() {
  return useContext(LenisContext);
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  // The admin CRM (/admin/*) is a plain functional dashboard whose layout
  // (app/admin/layout.tsx) builds its own `position: fixed` shell with
  // internal `overflow-y: auto` scroll containers. Lenis hijacks wheel/touch
  // input globally and redirects it into a smooth-scrolled window/document —
  // but the document behind that fixed shell has nothing to scroll, so the
  // page just feels frozen / unscrollable. Skip Lenis entirely on admin
  // routes and fall back to plain native scrolling, which the admin shell
  // is already built for.
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (isAdmin) return;

    // Register inside effect — safe from SSR / server-render context
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 3),   // ease-out-cubic — quick start, clean stop
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    // ── GSAP + Lenis integration ──────────────────────────────
    // Drive Lenis from GSAP's ticker (single unified RAF loop)
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Notify ScrollTrigger on every Lenis scroll event
    lenis.on("scroll", ScrollTrigger.update);
    // ─────────────────────────────────────────────────────────

    return () => {
      gsap.ticker.remove(onTick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isAdmin]);

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current }}>
      {children}
    </LenisContext.Provider>
  );
}
