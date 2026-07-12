"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortal } from "./PortalProvider";
import ElevateLogo from "@/components/ui/ElevateLogo";

const NAV = [
  { href: "/portal",         label: "Dashboard" },
  { href: "/portal/orders",  label: "Orders"    },
  { href: "/portal/logos",   label: "Logos"     },
  { href: "/portal/account", label: "Account"   },
];

export default function PortalSidebar() {
  const pathname = usePathname();
  const { customer, logout } = usePortal();

  const isActive = (href: string) =>
    href === "/portal" ? pathname === "/portal" : pathname.startsWith(href);

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      background: "#07070A",
      borderRight: "1px solid rgba(255,255,255,0.05)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      position: "sticky",
      top: 0,
    }}>
      {/* Logo + portal label */}
      <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href="/portal"><ElevateLogo variant="nav" /></Link>
        <p style={{
          fontFamily: "var(--font-jetbrains,monospace)",
          fontSize: "0.44rem", letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(0,65,249,0.6)", marginTop: 8,
        }}>
          Client Portal
        </p>
      </div>

      {/* Company badge */}
      {customer && (
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(0,65,249,0.2)", border: "1px solid rgba(0,65,249,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-bebas,'Bebas Neue')", fontSize: "0.95rem", color: "#0041F9",
            }}>
              {customer.company.charAt(0)}
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", fontWeight: 500, lineHeight: 1.2 }}>
                {customer.contact.split(" ")[0]}
              </p>
              <p style={{ fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.44rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
                {customer.company}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "10px 0" }}>
        {NAV.map(item => (
          <Link key={item.href} href={item.href}>
            <div style={{
              padding: "11px 24px",
              background: isActive(item.href) ? "rgba(0,65,249,0.1)" : "transparent",
              borderLeft: `2px solid ${isActive(item.href) ? "#0041F9" : "transparent"}`,
              cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span style={{
                fontFamily: "var(--font-dm-sans,sans-serif)",
                fontSize: "0.82rem",
                color: isActive(item.href) ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.42)",
                fontWeight: isActive(item.href) ? 500 : 400,
              }}>
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 8 }}>
        <Link href="/products">
          <p style={{
            fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem",
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)", cursor: "pointer", transition: "color 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.28)"; }}
          >
            ← Shop
          </p>
        </Link>
        <button onClick={logout} style={{
          fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem",
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "rgba(241,87,87,0.5)", background: "none", border: "none",
          cursor: "pointer", textAlign: "left", padding: 0, transition: "color 0.15s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f15757"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(241,87,87,0.5)"; }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
