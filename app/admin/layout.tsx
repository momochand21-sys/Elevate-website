"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, Users, FileText, ShoppingBag,
  TrendingUp, Download, LogOut, Menu, X, Layers, Target,
} from "lucide-react";

const NAV = [
  { href: "/admin",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/products",  label: "Products",   icon: Package },
  { href: "/admin/customers", label: "Customers",  icon: Users },
  { href: "/admin/leads",     label: "Leads",      icon: Target },
  { href: "/admin/quotes",    label: "Quotes",     icon: FileText },
  { href: "/admin/orders",    label: "Orders",     icon: ShoppingBag },
  { href: "/admin/bundles",   label: "Bundles",    icon: Layers },
  { href: "/admin/export",    label: "Export",     icon: Download },
];

const S = {
  sidebar: {
    width: 220,
    bg: "#0a0a0a",
    border: "#141414",
  },
  accent: "#0041F9",
  text: "#F5F5F3",
  muted: "#555",
  surface: "#111",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const Sidebar = () => (
    <aside style={{
      width: S.sidebar.width, minHeight: "100vh",
      background: S.sidebar.bg,
      borderRight: `1px solid ${S.sidebar.border}`,
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: "24px 20px 20px",
        borderBottom: `1px solid ${S.sidebar.border}`,
      }}>
        <p style={{
          fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
          fontSize: "1.4rem", letterSpacing: "0.12em",
          color: S.text, lineHeight: 1,
        }}>ELEVATE</p>
        <p style={{
          fontSize: "0.52rem", letterSpacing: "0.18em",
          textTransform: "uppercase", color: S.muted, marginTop: 4,
        }}>Admin</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 20px",
                color: active ? S.text : S.muted,
                background: active ? "rgba(0,65,249,0.08)" : "transparent",
                borderLeft: active ? `2px solid ${S.accent}` : "2px solid transparent",
                fontSize: "0.78rem", letterSpacing: "0.03em",
                transition: "all 0.15s",
                cursor: "pointer",
              }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = "#9A9A9A";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = S.muted;
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <Icon size={14} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "16px 0", borderTop: `1px solid ${S.sidebar.border}` }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 20px", width: "100%",
            background: "none", border: "none",
            color: S.muted, fontSize: "0.78rem",
            cursor: "pointer", transition: "color 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = S.muted; }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9500,
      background: "#030303",
      fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
      cursor: "default", display: "flex",
    }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block" style={{ width: S.sidebar.width, flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)" }}
          onClick={() => setOpen(false)}
        />
      )}
      {open && (
        <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 201 }}>
          <Sidebar />
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        {/* Mobile top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid #141414",
          background: "#0a0a0a",
        }} className="md:hidden">
          <p style={{
            fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
            fontSize: "1.2rem", letterSpacing: "0.1em", color: S.text,
          }}>ELEVATE ADMIN</p>
          <button
            onClick={() => setOpen(!open)}
            style={{ background: "none", border: "none", color: S.text, cursor: "pointer" }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
