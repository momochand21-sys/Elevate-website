"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, FileText, ShoppingBag, Clock, Activity, CheckCircle, ArrowRight, Wallet, Users, Package } from "lucide-react";
import type { DashboardStats } from "@/lib/admin/types";

const S = {
  text: "#F5F5F3",
  muted: "#777",
  accent: "#0041F9",
  surface: "#0f0f0f",
  card: "#111",
  border: "#1a1a1a",
  success: "#22c55e",
  warning: "#f59e0b",
};

function fmt(n: number) {
  return n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({
  label, value, sub, icon: Icon, color = S.accent, href,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: string; href?: string;
}) {
  const inner = (
    <div style={{
      background: S.card, border: `1px solid ${S.border}`,
      padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12,
      transition: "border-color 0.2s",
    }}
      onMouseEnter={(e) => { if (href) (e.currentTarget as HTMLElement).style.borderColor = color; }}
      onMouseLeave={(e) => { if (href) (e.currentTarget as HTMLElement).style.borderColor = S.border; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: S.muted }}>
          {label}
        </p>
        <Icon size={14} color={color} />
      </div>
      <p style={{ fontSize: "1.6rem", fontWeight: 700, color: S.text, lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: "0.72rem", color: S.muted }}>{sub}</p>}
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return (
    <div style={{ padding: 48, color: S.muted, fontSize: "0.8rem" }}>Loading…</div>
  );

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
          fontSize: "2rem", letterSpacing: "0.06em", color: S.text,
          lineHeight: 1, marginBottom: 6,
        }}>Dashboard</h1>
        <p style={{ fontSize: "0.75rem", color: S.muted }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Primary stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 16, marginBottom: 24,
      }}>
        <StatCard label="Total Revenue" value={`£${fmt(stats.totalRevenue)}`} icon={TrendingUp} color={S.accent} />
        <StatCard label="Total Profit" value={`£${fmt(stats.totalProfit)}`} icon={TrendingUp} color={S.success} />
        <StatCard label="Avg Margin" value={`${stats.avgMargin}%`} icon={Activity} color={S.warning} />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color={S.accent} href="/admin/orders" />
      </div>

      {/* Secondary stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16, marginBottom: 48,
      }}>
        <StatCard label="Total Quotes" value={stats.totalQuotes} icon={FileText} href="/admin/quotes" />
        <StatCard label="Pending Quotes" value={stats.pendingQuotes} icon={Clock} color={S.warning} href="/admin/quotes" />
        <StatCard label="In Production" value={stats.ordersInProduction} icon={Activity} color="#06b6d4" href="/admin/orders" />
        <StatCard label="Completed" value={stats.completedOrders} icon={CheckCircle} color={S.success} href="/admin/orders" />
      </div>

      {/* This month + insights */}
      <p style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: S.muted, marginBottom: 16 }}>
        This Month &amp; Insights
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16, marginBottom: 48,
      }}>
        <StatCard label="This Month Revenue" value={`£${fmt(stats.thisMonthRevenue)}`} icon={TrendingUp} color={S.accent} />
        <StatCard label="This Month Profit" value={`£${fmt(stats.thisMonthProfit)}`} icon={TrendingUp} color={S.success} />
        <StatCard label="Avg Order Value" value={`£${fmt(stats.avgOrderValue)}`} icon={Wallet} color="#06b6d4" />
        <StatCard label="Best Customer" value={stats.bestCustomer} sub={stats.bestCustomerRevenue ? `£${fmt(stats.bestCustomerRevenue)} total` : undefined} icon={Users} color={S.warning} />
        <StatCard label="Most Ordered" value={stats.topProduct} sub={stats.topProductQty ? `${stats.topProductQty} units` : undefined} icon={Package} color="#8b5cf6" />
      </div>

      {/* Quick actions */}
      <div>
        <p style={{
          fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase",
          color: S.muted, marginBottom: 16,
        }}>Quick Actions</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { label: "New Quote",     href: "/admin/quotes/new" },
            { label: "New Customer",  href: "/admin/customers/new" },
            { label: "View Orders",   href: "/admin/orders" },
            { label: "Export Data",   href: "/admin/export" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px", border: "1px solid #1a1a1a",
                background: "#0a0a0a", cursor: "pointer", transition: "all 0.15s",
                color: S.muted, fontSize: "0.8rem",
              }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = S.accent;
                  el.style.color = S.text;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "#1a1a1a";
                  el.style.color = S.muted;
                }}
              >
                {label}
                <ArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
