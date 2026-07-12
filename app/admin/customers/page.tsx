"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import type { Customer } from "@/lib/admin/types";

const S = {
  text: "#F5F5F3", muted: "#777", accent: "#0041F9",
  card: "#111", border: "#1a1a1a", success: "#22c55e", warning: "#f59e0b",
};

const LOGO_LABELS: Record<Customer["digitisedLogoStatus"], string> = {
  none: "No Logo", pending: "Pending", complete: "Digitised",
};
const LOGO_COLORS: Record<Customer["digitisedLogoStatus"], string> = {
  none: S.muted, pending: S.warning, complete: S.success,
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers").then((r) => r.json()).then(setCustomers);
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return c.company.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
            fontSize: "2rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1, marginBottom: 6,
          }}>Customers</h1>
          <p style={{ fontSize: "0.72rem", color: S.muted }}>{customers.length} customers</p>
        </div>
        <Link href="/admin/customers/new">
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px", background: S.accent, border: "none",
            color: "#fff", fontSize: "0.7rem", cursor: "pointer",
          }}>
            <Plus size={13} /> New Customer
          </button>
        </Link>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 24, maxWidth: 340 }}>
        <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: S.muted }} />
        <input
          placeholder="Search company, contact, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "9px 12px 9px 34px",
            background: "#0a0a0a", border: "1px solid #1a1a1a",
            color: S.text, fontSize: "0.8rem", outline: "none",
            fontFamily: "inherit", boxSizing: "border-box",
          }}
          onFocus={(e) => { e.target.style.borderColor = S.accent; }}
          onBlur={(e) => { e.target.style.borderColor = "#1a1a1a"; }}
        />
      </div>

      <div style={{ border: "1px solid #1a1a1a", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a" }}>
              {["Company", "Contact", "Email", "Phone", "Logo Status", "Orders", "Created", ""].map((h) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id}
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid #141414" : "none", transition: "background 0.12s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0a0a0a"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <td style={{ padding: "12px 16px", color: S.text, fontWeight: 500 }}>{c.company}</td>
                <td style={{ padding: "12px 16px", color: S.muted }}>{c.contact}</td>
                <td style={{ padding: "12px 16px", color: S.muted }}>{c.email}</td>
                <td style={{ padding: "12px 16px", color: S.muted }}>{c.phone}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase",
                    color: LOGO_COLORS[c.digitisedLogoStatus],
                  }}>
                    {LOGO_LABELS[c.digitisedLogoStatus]}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", color: S.muted }}>{c.orderIds.length}</td>
                <td style={{ padding: "12px 16px", color: S.muted, fontSize: "0.72rem" }}>
                  {new Date(c.createdAt).toLocaleDateString("en-GB")}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Link href={`/admin/customers/${c.id}`}>
                    <button style={{
                      background: "none", border: "1px solid #222", padding: "5px 10px",
                      color: S.muted, fontSize: "0.65rem", cursor: "pointer",
                    }}>View</button>
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: "48px 16px", textAlign: "center", color: S.muted, fontSize: "0.8rem" }}>
                  {search ? "No customers match your search" : "No customers yet — add your first customer"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
