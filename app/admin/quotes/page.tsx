"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import type { Quote, QuoteStatus } from "@/lib/admin/types";

const S = { text: "#F5F5F3", muted: "#777", accent: "#0041F9", border: "#1a1a1a", success: "#22c55e", danger: "#ef4444", warning: "#f59e0b" };

const STATUS_COLORS: Record<QuoteStatus, string> = {
  new: "#0041F9", sent: "#f59e0b", approved: "#22c55e", rejected: "#ef4444", converted: "#8b5cf6",
};
const STATUS_LABELS: Record<QuoteStatus, string> = {
  new: "New", sent: "Sent", approved: "Approved", rejected: "Rejected", converted: "Converted",
};

const FILTERS: (QuoteStatus | "all")[] = ["all", "new", "sent", "approved", "rejected", "converted"];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filter, setFilter] = useState<QuoteStatus | "all">("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/quotes").then((r) => r.json()).then(setQuotes);
  }, []);

  async function deleteQuote(id: string, reference: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete quote ${reference}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    if (res.ok) setQuotes((prev) => prev.filter((q) => q.id !== id));
  }

  const filtered = filter === "all" ? quotes : quotes.filter((q) => q.status === filter);

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "2rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1, marginBottom: 6 }}>Quotes</h1>
          <p style={{ fontSize: "0.72rem", color: S.muted }}>{quotes.length} total</p>
        </div>
        <Link href="/admin/quotes/new">
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: S.accent, border: "none", color: "#fff", fontSize: "0.7rem", cursor: "pointer" }}>
            <Plus size={13} /> New Quote
          </button>
        </Link>
      </div>

      {/* Status filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 14px", fontSize: "0.65rem", letterSpacing: "0.1em",
              textTransform: "uppercase", cursor: "pointer",
              background: filter === f ? (f === "all" ? S.accent : STATUS_COLORS[f as QuoteStatus] ?? S.accent) : "transparent",
              border: `1px solid ${filter === f ? "transparent" : "#2a2a2a"}`,
              color: filter === f ? "#fff" : S.muted,
              transition: "all 0.15s",
            }}
          >
            {f === "all" ? "All" : STATUS_LABELS[f as QuoteStatus]}
            {f !== "all" && <span style={{ marginLeft: 6, opacity: 0.7 }}>({quotes.filter((q) => q.status === f).length})</span>}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid #1a1a1a", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a" }}>
              {["Reference", "Company", "Contact", "Items", "Revenue", "Est. Profit", "Margin", "Status", "Date", ""].map((h) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((q, i) => (
              <tr key={q.id}
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid #141414" : "none", transition: "background 0.12s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0a0a0a"; setHoveredId(q.id); }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; setHoveredId(null); }}
              >
                <td style={{ padding: "12px 16px", color: S.accent, fontFamily: "var(--font-jetbrains, monospace)", fontSize: "0.72rem" }}>{q.reference}</td>
                <td style={{ padding: "12px 16px", color: S.text }}>{q.company}</td>
                <td style={{ padding: "12px 16px", color: S.muted }}>{q.contact}</td>
                <td style={{ padding: "12px 16px", color: S.muted }}>{q.items.length}</td>
                <td style={{ padding: "12px 16px", color: S.text }}>
                  £{q.totalRevenue.toFixed(2)}
                  {q.discountPercent > 0 && (
                    <span style={{ marginLeft: 7, fontSize: "0.6rem", letterSpacing: "0.06em", color: S.danger, background: "rgba(239,68,68,0.12)", padding: "2px 6px" }}>
                      −{q.discountPercent}%
                    </span>
                  )}
                </td>
                <td style={{ padding: "12px 16px", color: q.grossProfit >= 0 ? S.success : S.danger }}>
                  £{q.grossProfit.toFixed(2)}
                </td>
                <td style={{ padding: "12px 16px", color: S.muted }}>{q.margin}%</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase",
                    color: STATUS_COLORS[q.status],
                    background: `${STATUS_COLORS[q.status]}18`,
                    padding: "3px 8px",
                  }}>{STATUS_LABELS[q.status]}</span>
                </td>
                <td style={{ padding: "12px 16px", color: S.muted, fontSize: "0.72rem" }}>
                  {new Date(q.createdAt).toLocaleDateString("en-GB")}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
                    <Link href={`/admin/quotes/${q.id}`}>
                      <button style={{ background: "none", border: "1px solid #222", padding: "5px 10px", color: S.muted, fontSize: "0.65rem", cursor: "pointer" }}>View</button>
                    </Link>
                    <button
                      onClick={(e) => deleteQuote(q.id, q.reference, e)}
                      title="Delete quote"
                      style={{ display: hoveredId === q.id ? "flex" : "none", alignItems: "center", padding: "5px 7px", background: "transparent", border: "1px solid rgba(239,68,68,0.35)", color: S.danger, fontSize: "0.65rem", cursor: "pointer" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: "48px 16px", textAlign: "center", color: S.muted, fontSize: "0.8rem" }}>
                  No quotes {filter !== "all" ? `with status "${filter}"` : "yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
