"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/admin/types";

const S = { text: "#F5F5F3", muted: "#777", accent: "#0041F9", border: "#1a1a1a", success: "#22c55e", danger: "#ef4444" };

const STATUSES: { key: OrderStatus; label: string; color: string }[] = [
  { key: "payment_pending", label: "Payment Pending", color: "#555" },
  { key: "paid",            label: "Paid",            color: "#0041F9" },
  { key: "sent_to_supplier",label: "Sent to Supplier",color: "#06b6d4" },
  { key: "in_production",   label: "In Production",   color: "#f59e0b" },
  { key: "quality_check",   label: "Quality Check",   color: "#8b5cf6" },
  { key: "dispatched",      label: "Dispatched",      color: "#f97316" },
  { key: "completed",       label: "Completed",       color: "#22c55e" },
];

type ViewMode = "kanban" | "list";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [view, setView] = useState<ViewMode>("list");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders").then((r) => r.json()).then(setOrders);
  }, []);

  async function deleteOrder(id: string, reference: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete order ${reference}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    if (res.ok) setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  async function updateStatus(orderId: string, status: OrderStatus) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    }
  }

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 1200 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "2rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1, marginBottom: 6 }}>Orders</h1>
          <p style={{ fontSize: "0.72rem", color: S.muted }}>{orders.length} total</p>
        </div>
        {/* View toggle */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["list", "kanban"] as ViewMode[]).map((v) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "7px 14px", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "capitalize",
              cursor: "pointer", background: view === v ? "#1a1a1a" : "transparent",
              border: "1px solid #2a2a2a", color: view === v ? S.text : S.muted, transition: "all 0.15s",
            }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={() => setFilter("all")} style={{ padding: "5px 14px", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", background: filter === "all" ? S.accent : "transparent", border: `1px solid ${filter === "all" ? "transparent" : "#2a2a2a"}`, color: filter === "all" ? "#fff" : S.muted }}>
          All ({orders.length})
        </button>
        {STATUSES.map(({ key, label, color }) => (
          <button key={key} onClick={() => setFilter(key)} style={{ padding: "5px 14px", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", background: filter === key ? color : "transparent", border: `1px solid ${filter === key ? "transparent" : "#2a2a2a"}`, color: filter === key ? "#fff" : S.muted, transition: "all 0.15s" }}>
            {label} ({orders.filter((o) => o.status === key).length})
          </button>
        ))}
      </div>

      {/* Kanban */}
      {view === "kanban" && (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
          {STATUSES.map(({ key, label, color }) => {
            const col = orders.filter((o) => o.status === key);
            return (
              <div key={key} style={{ minWidth: 220, flex: "0 0 220px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
                  <p style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted }}>{label}</p>
                  <span style={{ fontSize: "0.6rem", color: S.muted, marginLeft: "auto" }}>{col.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.map((o) => (
                    <Link key={o.id} href={`/admin/orders/${o.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ position: "relative", background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "12px 14px", cursor: "pointer", transition: "border-color 0.15s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = color; setHoveredId(o.id); }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1a1a1a"; setHoveredId(null); }}
                      >
                        {hoveredId === o.id && (
                          <button onClick={(e) => deleteOrder(o.id, o.reference, e)} title="Delete order"
                            style={{ position: "absolute", top: 8, right: 8, display: "flex", padding: "4px 5px", background: "#0f0f0f", border: "1px solid rgba(239,68,68,0.4)", color: S.danger, cursor: "pointer" }}>
                            <Trash2 size={11} />
                          </button>
                        )}
                        <p style={{ fontSize: "0.68rem", fontFamily: "var(--font-jetbrains, monospace)", color, marginBottom: 4 }}>{o.reference}</p>
                        <p style={{ fontSize: "0.78rem", color: S.text, marginBottom: 4 }}>{o.company}</p>
                        <p style={{ fontSize: "0.7rem", color: S.accent, fontWeight: 600 }}>£{o.totalRevenue.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                  {col.length === 0 && (
                    <div style={{ padding: "24px 12px", textAlign: "center", border: "1px dashed #1a1a1a", color: S.muted, fontSize: "0.7rem" }}>—</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List */}
      {view === "list" && (
        <div style={{ border: "1px solid #1a1a1a", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a" }}>
                {["Reference", "Company", "Revenue", "Profit", "Margin", "Status", "Date", "Action"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => {
                const st = STATUSES.find((s) => s.key === o.status);
                return (
                  <tr key={o.id}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid #141414" : "none", transition: "background 0.12s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0a0a0a"; setHoveredId(o.id); }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; setHoveredId(null); }}
                  >
                    <td style={{ padding: "12px 16px", color: S.accent, fontFamily: "var(--font-jetbrains, monospace)", fontSize: "0.72rem" }}>{o.reference}</td>
                    <td style={{ padding: "12px 16px", color: S.text }}>{o.company}</td>
                    <td style={{ padding: "12px 16px", color: S.text }}>£{o.totalRevenue.toFixed(2)}</td>
                    <td style={{ padding: "12px 16px", color: o.grossProfit >= 0 ? S.success : S.danger }}>£{o.grossProfit.toFixed(2)}</td>
                    <td style={{ padding: "12px 16px", color: S.muted }}>{o.margin}%</td>
                    <td style={{ padding: "12px 16px" }}>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: "#0a0a0a", border: "1px solid #2a2a2a", color: st?.color ?? S.muted, fontSize: "0.65rem", padding: "4px 8px", cursor: "pointer", outline: "none" }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "12px 16px", color: S.muted, fontSize: "0.72rem" }}>{new Date(o.createdAt).toLocaleDateString("en-GB")}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <Link href={`/admin/orders/${o.id}`}>
                          <button style={{ background: "none", border: "1px solid #222", padding: "5px 10px", color: S.muted, fontSize: "0.65rem", cursor: "pointer" }}>View</button>
                        </Link>
                        <button
                          onClick={(e) => deleteOrder(o.id, o.reference, e)}
                          title="Delete order"
                          style={{ display: hoveredId === o.id ? "flex" : "none", alignItems: "center", padding: "5px 7px", background: "transparent", border: "1px solid rgba(239,68,68,0.35)", color: S.danger, fontSize: "0.65rem", cursor: "pointer" }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "48px 16px", textAlign: "center", color: S.muted, fontSize: "0.8rem" }}>No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
