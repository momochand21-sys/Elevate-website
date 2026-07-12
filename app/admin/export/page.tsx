"use client";

import { Download } from "lucide-react";

const S = { text: "#F5F5F3", muted: "#777", accent: "#0041F9", border: "#1a1a1a", success: "#22c55e" };

const EXPORTS = [
  { type: "orders",    label: "Orders",         desc: "All orders with revenue, costs, profit, margin and status" },
  { type: "profit",    label: "Profit Report",  desc: "Full profit breakdown per order — garment cost, decoration, fees, shipping" },
  { type: "quotes",    label: "Quotes",         desc: "All quotes with estimated revenue, profit, margin and status" },
  { type: "customers", label: "Customers",      desc: "Customer database — company, contact, address, logo status" },
  { type: "products",  label: "Products",       desc: "Product database — codes, prices, positions, sizes" },
];

export default function ExportPage() {
  function download(type: string) {
    const a = document.createElement("a");
    a.href = `/api/admin/export?type=${type}`;
    a.download = `${type}.csv`;
    a.click();
  }

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 700 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "2rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1, marginBottom: 6 }}>Export</h1>
        <p style={{ fontSize: "0.72rem", color: S.muted }}>Download your data as CSV — import into Excel, Google Sheets, or any accounting tool</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {EXPORTS.map(({ type, label, desc }) => (
          <div key={type} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 20px", background: "#0f0f0f", border: "1px solid #1a1a1a",
            gap: 16,
          }}>
            <div>
              <p style={{ fontSize: "0.85rem", color: S.text, marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: "0.72rem", color: S.muted }}>{desc}</p>
            </div>
            <button
              onClick={() => download(type)}
              style={{
                flexShrink: 0,
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", background: "transparent",
                border: "1px solid #2a2a2a", color: S.muted,
                fontSize: "0.68rem", cursor: "pointer", whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = S.accent; (e.currentTarget as HTMLElement).style.color = S.text; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"; (e.currentTarget as HTMLElement).style.color = S.muted; }}
            >
              <Download size={12} /> Download CSV
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, background: "#0a0a0a", border: "1px solid #1a1a1a", padding: "16px 20px" }}>
        <p style={{ fontSize: "0.72rem", color: S.muted, lineHeight: 1.7 }}>
          CSV files use UTF-8 encoding and UK date format (DD/MM/YYYY).
          Open in Excel: File → Import → From Text/CSV → set delimiter to comma.
        </p>
      </div>
    </div>
  );
}
