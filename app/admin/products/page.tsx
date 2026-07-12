"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, RefreshCw } from "lucide-react";
import type { Product } from "@/lib/admin/types";

const S = {
  text: "#F5F5F3", muted: "#777", accent: "#0041F9",
  surface: "#0f0f0f", card: "#111", border: "#1a1a1a",
  success: "#22c55e", danger: "#ef4444",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/products").then((r) => r.json()).then(setProducts);
  }, []);

  async function syncToWebsite() {
    setSyncing(true);
    setSyncMsg("");
    // Sync the first product with syncWebsite=true to trigger regeneration
    const first = products.find((p) => p.active);
    if (first) {
      await fetch(`/api/admin/products/${first.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...first, syncWebsite: true }),
      });
    }
    setSyncing(false);
    setSyncMsg("product-pricing.ts regenerated — website will hot-reload");
    setTimeout(() => setSyncMsg(""), 4000);
  }

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
            fontSize: "2rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1, marginBottom: 6,
          }}>Products</h1>
          <p style={{ fontSize: "0.72rem", color: S.muted }}>
            {products.length} products · Edit prices here, then sync to the website
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {syncMsg && <p style={{ fontSize: "0.72rem", color: S.success }}>{syncMsg}</p>}
          <button
            onClick={syncToWebsite}
            disabled={syncing}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px", background: "transparent",
              border: "1px solid #2a2a2a", color: S.muted,
              fontSize: "0.7rem", cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = S.accent; (e.currentTarget as HTMLElement).style.color = S.text; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"; (e.currentTarget as HTMLElement).style.color = S.muted; }}
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            Sync to Website
          </button>
          <Link href="/admin/products/new">
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px", background: S.accent, border: "none",
              color: "#fff", fontSize: "0.7rem", cursor: "pointer",
            }}>
              <Plus size={13} /> Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid #1a1a1a", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a" }}>
              {["Code", "Name", "Category", "Cost Price", "Sell Price", "Branding Positions", "Sizes", "Status", ""].map((h) => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left",
                  fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase",
                  color: S.muted, fontWeight: 500,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.code} style={{
                borderBottom: i < products.length - 1 ? "1px solid #141414" : "none",
                background: "transparent",
                transition: "background 0.12s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0a0a0a"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <td style={{ padding: "12px 16px", color: S.accent, fontFamily: "var(--font-jetbrains, monospace)", fontSize: "0.72rem" }}>
                  {p.code}
                </td>
                <td style={{ padding: "12px 16px", color: S.text }}>{p.name}</td>
                <td style={{ padding: "12px 16px", color: S.muted }}>{p.category}</td>
                <td style={{ padding: "12px 16px", color: S.text }}>£{p.garmentCost.toFixed(2)}</td>
                <td style={{ padding: "12px 16px", color: S.text }}>£{p.garmentSellPrice.toFixed(2)}</td>
                <td style={{ padding: "12px 16px", color: S.muted, fontSize: "0.72rem" }}>
                  {p.brandingPositions.length} positions
                </td>
                <td style={{ padding: "12px 16px", color: S.muted, fontSize: "0.72rem" }}>
                  {p.sizes.join(", ")}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase",
                    color: p.active ? S.success : S.danger,
                    background: p.active ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                    padding: "3px 8px",
                  }}>
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Link href={`/admin/products/${p.code}`}>
                    <button style={{
                      display: "flex", alignItems: "center", gap: 4,
                      background: "none", border: "1px solid #222", padding: "5px 10px",
                      color: S.muted, fontSize: "0.65rem", cursor: "pointer",
                    }}>
                      <Edit2 size={11} /> Edit
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: "48px 16px", textAlign: "center", color: S.muted, fontSize: "0.8rem" }}>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
