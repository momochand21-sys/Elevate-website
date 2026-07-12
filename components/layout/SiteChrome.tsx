"use client";

import { usePathname } from "next/navigation";
import CustomCursor from "@/components/ui/CustomCursor";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Navbar from "@/components/layout/Navbar";
import TopBar from "@/components/layout/TopBar";
import BasketDrawer from "@/components/ui/BasketDrawer";
import QuoteRequestModal from "@/components/ui/QuoteRequestModal";

/**
 * Public marketing-site chrome (top bar, nav, basket, quote modal, custom
 * cursor, scroll progress, film-grain overlay).
 *
 * Renders nothing on /admin (the CRM) so the internal dashboard stays a clean,
 * plain admin tool — no marketing cursor, grain texture, or customer-facing nav
 * bleeding over the top of it.
 */
export default function SiteChrome() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <CustomCursor />
      <ScrollProgress />
      <TopBar />
      <Navbar />
      <BasketDrawer />
      <QuoteRequestModal />
    </>
  );
}
