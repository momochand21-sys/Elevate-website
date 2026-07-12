"use client";

import { motion } from "framer-motion";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/TextReveal";
import ElevateLogo from "@/components/ui/ElevateLogo";

const footerLinks = {
  Products: ["Hoodies", "Polo Shirts", "Gilets", "1/4 Zips", "Caps & Beanies", "Bundle Deals"],
  Help: ["FAQ", "Size Guide", "Delivery Info", "Returns Policy"],
  Industries: ["Construction", "Car Washes", "Cleaning", "Landscaping", "Security", "Hospitality"],
  Contact: ["info@elevateworkwear.com", "Blackburn, UK"],
};

const socials = [
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark border-t border-border relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] orb orb-blue opacity-10" />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Top section */}
        <div className="py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <FadeUp>
              <div className="mb-4">
                <ElevateLogo variant="full" />
              </div>
              <p className="text-muted text-sm font-light leading-relaxed max-w-[260px] mb-6">
                Premium B2B workwear solutions for businesses that demand excellence. Quality without compromise.
              </p>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-9 h-9 border border-border flex items-center justify-center text-muted hover:text-blue hover:border-blue/50 transition-all duration-300 cursor-pointer"
                    data-cursor="hover"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links], i) => (
            <StaggerContainer key={category} delay={0.1 + i * 0.05}>
              <StaggerItem>
                <h4 className="font-mono text-[9px] tracking-[0.2em] uppercase text-blue mb-4">
                  {category}
                </h4>
              </StaggerItem>
              <ul className="space-y-2.5">
                {links.map((link) => {
                  const hrefMap: Record<string,string> = {
                    "FAQ": "/faq",
                    "Bundle Deals": "/bundle-deals",
                    "Hoodies": "/products/hoodies/heavyweight-hoodie",
                    "Polo Shirts": "/products/polo-shirts/workwear-polo",
                    "Gilets": "/products/gilets/workwear-gilet",
                    "1/4 Zips": "/products/quarter-zip/workwear-quarter-zip",
                    "Caps & Beanies": "/products/caps-beanies/workwear-beanie",
                    "Size Guide": "/faq#sizing",
                    "Delivery Info": "/faq#production-delivery",
                    "Returns Policy": "/faq#returns-refunds",
                    "info@elevateworkwear.com": "mailto:info@elevateworkwear.com",
                  };
                  const href = hrefMap[link] ?? "#";
                  return (
                  <StaggerItem key={link}>
                    <li>
                      <a
                        href={href}
                        className="text-muted hover:text-silver text-sm font-light transition-colors duration-200 animated-underline cursor-pointer"
                      >
                        {link}
                      </a>
                    </li>
                  </StaggerItem>
                  );
                })}
              </ul>
            </StaggerContainer>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-muted">
            © 2024 Elevate Workwear Solutions Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a
                key={item}
                href="#"
                className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted hover:text-silver transition-colors duration-200 cursor-pointer"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
