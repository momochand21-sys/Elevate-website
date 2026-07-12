"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";
import ElevateLogo from "@/components/ui/ElevateLogo";
import { cn } from "@/lib/utils";
import { useBasket } from "@/lib/basket-context";
import { useQuoteModal } from "@/lib/quote-modal-context";
import BookCallModal from "@/components/sections/BookCallModal";

/* ─────────────────────────────────────────────────────────────────
   NAV DATA
───────────────────────────────────────────────────────────────── */
interface DropdownItem { label: string; href: string }
interface NavLink {
  label:    string;
  href:     string;
  dropdown?: DropdownItem[];
  action?:  "book-call";
}

const navLinks: NavLink[] = [
  {
    label: "Products",
    href:  "/products",
    dropdown: [
      { label: "Bundle Deals",         href: "/bundle-deals"           },
      { label: "Corporate Wear",       href: "/products#corporate"     },
      { label: "Casualwear",           href: "/products#casual"        },
      { label: "Headwear",             href: "/products#headwear"      },
      { label: "Outerwear",            href: "/products#outerwear"     },
      { label: "PPE & Safety Wear",    href: "/products#ppe"           },
      { label: "Hospitality Wear",     href: "/products#hospitality"   },
    ],
  },
  { label: "Book a Call", href: "", action: "book-call" },
  { label: "Results",  href: "/our-work" },
  { label: "About",    href: "#about"    },
  { label: "Services", href: "#services" },
  { label: "Why Us",   href: "#why-us"   },
  { label: "FAQ",      href: "/faq"       },
];

/* ─────────────────────────────────────────────────────────────────
   DESKTOP DROPDOWN
───────────────────────────────────────────────────────────────── */
function DesktopDropdown({
  items,
  onNavigate,
}: {
  items: DropdownItem[];
  onNavigate: (href: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 min-w-[192px] overflow-hidden z-50"
      style={{
        background:     "rgba(4,4,8,0.97)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border:         "1px solid rgba(255,255,255,0.07)",
        borderTop:      "1px solid rgba(0,65,249,0.45)",
        boxShadow:      "0 16px 48px rgba(0,0,0,0.55)",
      }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => onNavigate(item.href)}
          className="w-full flex items-center gap-3 px-5 py-3 group text-left transition-colors duration-200"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div
            className="flex-shrink-0 w-[4px] h-[4px] rounded-full transition-all duration-200 group-hover:w-[6px]"
            style={{ background: "#0041F9", opacity: 0.5, transition: "opacity 0.2s, width 0.2s" }}
          />
          <span
            className="font-mono text-[9px] tracking-[0.16em] uppercase transition-colors duration-200"
            style={{ color: "rgba(160,168,190,0.7)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(245,245,243,0.9)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(160,168,190,0.7)")}
          >
            {item.label}
          </span>
        </button>
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const router = useRouter();
  const { totalQty, openBasket } = useBasket();
  const { open: openQuote } = useQuoteModal();

  const [scrolled,          setScrolled]          = useState(false);
  const [mobileOpen,        setMobileOpen]         = useState(false);
  const [mobileView,        setMobileView]         = useState<"main" | "products">("main");
  const [activeDropdown,    setActiveDropdown]     = useState<string | null>(null);
  const [bookOpen,          setBookOpen]           = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Navigation helper ── */
  const navigate = (href: string) => {
    setMobileOpen(false);
    setMobileView("main");
    setActiveDropdown(null);

    if (href.startsWith("/")) {
      router.push(href);
    } else {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push(`/${href}`);
      }
    }
  };

  /* ── Click handler for top-level nav items — some open the booking modal instead of routing ── */
  const handleLinkClick = (link: NavLink) => {
    if (link.action === "book-call") {
      setMobileOpen(false);
      setMobileView("main");
      setActiveDropdown(null);
      setBookOpen(true);
      return;
    }
    navigate(link.href);
  };

  /* ── Dropdown hover handlers with delay to prevent flickering ── */
  const showDropdown = (label: string) => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setActiveDropdown(label);
  };
  const scheduleHide = () => {
    hideTimeout.current = setTimeout(() => setActiveDropdown(null), 120);
  };
  const cancelHide = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          DESKTOP NAVBAR
      ══════════════════════════════════════════════════════════ */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: "transform", transform: "translateZ(0)" }}
        className={cn(
          "fixed left-0 right-0 z-[500] transition-all duration-300 top-[38px]",
          scrolled
            ? "bg-black/90 backdrop-blur-md border-b border-white/[0.04]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-16 md:h-[72px] flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="cursor-pointer flex-shrink-0"
            aria-label="Go to homepage"
          >
            <ElevateLogo variant="nav" />
          </button>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.dropdown && showDropdown(link.label)}
                onMouseLeave={() => link.dropdown && scheduleHide()}
              >
                <button
                  onClick={() => handleLinkClick(link)}
                  className="animated-underline font-mono text-[10px] tracking-[0.18em] uppercase text-muted hover:text-off-white transition-colors duration-300 cursor-pointer flex items-center gap-1.5"
                >
                  {link.label}
                  {link.dropdown && (
                    <motion.svg
                      width="8" height="8" viewBox="0 0 8 8" fill="none"
                      animate={{ rotate: activeDropdown === link.label ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </motion.svg>
                  )}
                </button>

                {/* Dropdown panel */}
                <AnimatePresence>
                  {link.dropdown && activeDropdown === link.label && (
                    <div
                      onMouseEnter={cancelHide}
                      onMouseLeave={scheduleHide}
                    >
                      <DesktopDropdown
                        items={link.dropdown}
                        onNavigate={navigate}
                      />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/portal" className="hidden lg:block font-mono text-[9px] tracking-[0.18em] uppercase text-muted hover:text-off-white transition-colors duration-200 cursor-pointer">
              Client Portal
            </Link>

            {/* Mobile-only quick actions — Products & Book a Call, always visible without opening the menu */}
            <button
              onClick={() => navigate("/products")}
              className="lg:hidden font-mono text-[9px] tracking-[0.14em] uppercase text-muted hover:text-off-white transition-colors duration-200 cursor-pointer whitespace-nowrap"
            >
              Products
            </button>
            <button
              onClick={() => setBookOpen(true)}
              className="lg:hidden font-mono text-[9px] tracking-[0.14em] uppercase text-muted hover:text-off-white transition-colors duration-200 cursor-pointer whitespace-nowrap"
            >
              Book a Call
            </button>

            {/* Basket icon */}
            <button
              onClick={openBasket}
              className="relative flex items-center justify-center cursor-pointer"
              style={{ width: 36, height: 36 }}
              aria-label="Open basket"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4h12l-1.5 9H5.5L4 4z" stroke="rgba(245,245,243,0.6)" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M4 4L3 1H1" stroke="rgba(245,245,243,0.6)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7.5" cy="17" r="1" fill="rgba(245,245,243,0.6)"/>
                <circle cx="13.5" cy="17" r="1" fill="rgba(245,245,243,0.6)"/>
              </svg>
              {totalQty > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center"
                  style={{
                    minWidth: 16, height: 16, borderRadius: "50%",
                    background: "#0041F9",
                    fontFamily: "var(--font-jetbrains,monospace)",
                    fontSize: "0.45rem",
                    color: "#fff",
                    letterSpacing: 0,
                    padding: "0 3px",
                  }}
                >
                  {totalQty > 99 ? "99+" : totalQty}
                </span>
              )}
            </button>

            <MagneticButton
              className="!hidden lg:!flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase text-muted hover:text-off-white border border-white/10 hover:border-blue/40 transition-all duration-300 px-5 py-2.5"
              strength={25}
              onClick={() => setBookOpen(true)}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1C3.686 1 1 3.686 1 7s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.3" />
                <path d="M7 4v4l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Book a Call</span>
            </MagneticButton>

            <MagneticButton
              className="!hidden lg:!flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase text-off-white border border-blue/50 hover:border-blue hover:bg-blue/10 transition-all duration-300 px-5 py-2.5"
              strength={25}
              onClick={openQuote}
            >
              <span>Get a Quote</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6H10M6 2L10 6L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </MagneticButton>

            {/* Mobile hamburger */}
            <button
              onClick={() => { setMobileOpen(v => !v); setMobileView("main"); }}
              className="lg:hidden flex flex-col gap-[5px] p-2 cursor-pointer"
              aria-label="Toggle menu"
            >
              <motion.span animate={mobileOpen ? { rotate: 45,  y:  7 } : { rotate: 0, y: 0 }} className="block w-6 h-[1px] bg-off-white" transition={{ duration: 0.3 }}/>
              <motion.span animate={mobileOpen ? { opacity: 0 }         : { opacity: 1 }}       className="block w-6 h-[1px] bg-off-white" transition={{ duration: 0.3 }}/>
              <motion.span animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className="block w-6 h-[1px] bg-off-white" transition={{ duration: 0.3 }}/>
            </button>
          </div>
        </div>
      </motion.header>

      {/* ══════════════════════════════════════════════════════════
          MOBILE FULLSCREEN MENU
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)"   }}
            exit={{    clipPath: "inset(0 0 100% 0)"  }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[490] bg-black flex flex-col justify-center px-8 overflow-y-auto" style={{ top: 38 }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 orb orb-blue opacity-20 animate-pulse-glow"/>

            <div style={{ overflow: "hidden" }}>
            <AnimatePresence mode="wait" initial={false}>
              {mobileView === "main" ? (
                <motion.nav
                  key="main"
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0,   opacity: 1 }}
                  exit={{    x: -60, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-1"
                >
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ x: -40, opacity: 0 }}
                      animate={{ x: 0,   opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                    >
                      {link.dropdown ? (
                        /* ── Products: drills into the sub-category view ── */
                        <button
                          onClick={() => setMobileView("products")}
                          className="w-full flex items-center justify-between py-3 border-b border-white/[0.05] text-off-white/50 hover:text-off-white transition-colors"
                          style={{
                            fontFamily: "var(--font-bebas,'Bebas Neue')",
                            fontSize: "clamp(1.6rem,6vw,2.2rem)",
                            letterSpacing: "0.04em",
                            lineHeight: 1,
                          }}
                        >
                          {link.label}
                          <span className="text-blue/70 ml-4 flex-shrink-0" style={{ fontSize: "1.4rem", lineHeight: 1 }}>
                            →
                          </span>
                        </button>
                      ) : (
                        /* ── Regular link ── */
                        <button
                          onClick={() => handleLinkClick(link)}
                          className="w-full text-left py-3 border-b border-white/[0.05] text-off-white/50 hover:text-off-white transition-colors"
                          style={{
                            fontFamily: "var(--font-bebas,'Bebas Neue')",
                            fontSize: "clamp(1.6rem,6vw,2.2rem)",
                            letterSpacing: "0.04em",
                            lineHeight: 1,
                          }}
                        >
                          {link.label}
                        </button>
                      )}
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0,   opacity: 1 }}
                    transition={{ delay: 0.1 + navLinks.length * 0.07, ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                    className="mt-8 flex flex-col items-start gap-5"
                  >
                    <button
                      onClick={() => navigate("#cta")}
                      className="inline-flex items-center justify-center gap-3 bg-blue text-white font-mono text-sm tracking-[0.14em] uppercase px-8 py-4"
                    >
                      Get a Quote
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7H12M7 2L12 7L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => navigate("/portal")}
                      className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted hover:text-off-white transition-colors duration-200"
                    >
                      Client Portal
                    </button>
                  </motion.div>
                </motion.nav>
              ) : (
                /* ── Products sub-category view ── */
                <motion.nav
                  key="products"
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0,  opacity: 1 }}
                  exit={{    x: 60, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-1"
                >
                  <button
                    onClick={() => setMobileView("main")}
                    className="flex items-center gap-3 mb-4 text-blue/80 hover:text-blue transition-colors"
                  >
                    <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>←</span>
                    <span className="font-mono text-[11px] tracking-[0.18em] uppercase">Back</span>
                  </button>
                  {navLinks[0].dropdown!.map((sub, si) => (
                    <motion.button
                      key={sub.label}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0,   opacity: 1 }}
                      transition={{ delay: 0.05 + si * 0.05, ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
                      onClick={() => navigate(sub.href)}
                      className="w-full text-left py-3 border-b border-white/[0.05] text-off-white/50 hover:text-off-white transition-colors"
                      style={{
                        fontFamily: "var(--font-bebas,'Bebas Neue')",
                        fontSize: "clamp(1.5rem,5.5vw,2rem)",
                        letterSpacing: "0.04em",
                        lineHeight: 1,
                      }}
                    >
                      {sub.label}
                    </motion.button>
                  ))}
                </motion.nav>
              )}
            </AnimatePresence>
            </div>

            <p className="absolute bottom-8 left-8 font-mono text-[9px] tracking-[0.2em] uppercase text-muted">
              ELEVATE WORKWEAR © 2026
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <BookCallModal open={bookOpen} onClose={() => setBookOpen(false)} />
    </>
  );
}
