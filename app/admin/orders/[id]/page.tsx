"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Copy, FileText } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/admin/types";

const S = { text: "#F5F5F3", muted: "#777", accent: "#0041F9", success: "#22c55e", danger: "#ef4444", warning: "#f59e0b", border: "#1a1a1a" };

const STATUSES: { key: OrderStatus; label: string; color: string }[] = [
  { key: "payment_pending",  label: "Payment Pending", color: "#555" },
  { key: "paid",             label: "Paid",            color: "#0041F9" },
  { key: "sent_to_supplier", label: "Sent to Supplier",color: "#06b6d4" },
  { key: "in_production",    label: "In Production",   color: "#f59e0b" },
  { key: "quality_check",    label: "Quality Check",   color: "#8b5cf6" },
  { key: "dispatched",       label: "Dispatched",      color: "#f97316" },
  { key: "completed",        label: "Completed",       color: "#22c55e" },
];

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [costs, setCosts] = useState({ digitisingCost: 0, packagingCost: 0, paymentFee: 0, shippingCost: 0 });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data.error) { setNotFound(true); return; }
        setOrder(data);
        setCosts(data.costs);
      });
  }, [id]);

  async function save(patch: Partial<Order>) {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setOrder(data);
      setCosts(data.costs);
      setMsg("Saved");
      setTimeout(() => setMsg(""), 3000);
    }
  }

  // Duplicate this order into a brand-new draft (fresh reference, status reset).
  async function duplicate() {
    if (!order) return;
    if (!confirm("Create a new draft order copying everything from this one?")) return;
    setSaving(true);
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: order.company, contact: order.contact, email: order.email,
        phone: order.phone, address: order.address, customerId: order.customerId,
        items: order.items, costs: order.costs, discountPercent: order.discountPercent,
        orderNotes: order.orderNotes, logoFiles: order.logoFiles, status: "payment_pending",
      }),
    });
    setSaving(false);
    if (res.ok) {
      const created = await res.json();
      router.push(`/admin/orders/${created.id}`);
    }
  }

  if (notFound) return (
    <div style={{ padding: 48 }}>
      <p style={{ color: S.danger, fontSize: "0.85rem", marginBottom: 12 }}>Order not found.</p>
      <p style={{ color: S.muted, fontSize: "0.75rem", marginBottom: 20 }}>This order may have been deleted. You can go back to the quotes list and convert the quote again if needed.</p>
      <button onClick={() => router.back()} style={{ background: "none", border: "1px solid #2a2a2a", color: S.muted, padding: "8px 16px", fontSize: "0.7rem", cursor: "pointer" }}>← Go Back</button>
    </div>
  );
  if (!order) return <div style={{ padding: 48, color: S.muted, fontSize: "0.8rem" }}>Loading…</div>;

  const st = STATUSES.find((s) => s.key === order.status);

  // Next status in flow
  const statusIdx = STATUSES.findIndex((s) => s.key === order.status);
  const nextStatus = statusIdx < STATUSES.length - 1 ? STATUSES[statusIdx + 1] : null;

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36, flexWrap: "wrap" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: S.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "1.8rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1 }}>{order.reference}</h1>
          <p style={{ fontSize: "0.7rem", color: S.muted, marginTop: 4 }}>{order.company} · {new Date(order.createdAt).toLocaleDateString("en-GB", { dateStyle: "long" })}</p>
        </div>
        <span style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: st?.color ?? S.muted, background: `${st?.color ?? S.muted}18`, padding: "4px 10px" }}>
          {st?.label}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {msg && <p style={{ fontSize: "0.72rem", color: S.success }}>{msg}</p>}
          <button onClick={() => window.open(`/api/admin/orders/${id}/pdf`, "_blank")} title="Download branded PDF"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "transparent", border: "1px solid #2a2a2a", color: S.muted, fontSize: "0.7rem", cursor: "pointer", fontFamily: "inherit" }}>
            <FileText size={12} /> PDF
          </button>
          <button onClick={duplicate} disabled={saving} title="Create a new draft order from this one"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "transparent", border: "1px solid #2a2a2a", color: S.muted, fontSize: "0.7rem", cursor: "pointer", fontFamily: "inherit" }}>
            <Copy size={12} /> Duplicate
          </button>
        </div>
      </div>

      {/* Status flow */}
      <div style={{ display: "flex", gap: 4, marginBottom: 32, flexWrap: "wrap" }}>
        {STATUSES.map((s, i) => {
          const isDone = STATUSES.findIndex((x) => x.key === order.status) >= i;
          const isCurrent = order.status === s.key;
          return (
            <button
              key={s.key}
              onClick={() => save({ status: s.key })}
              style={{
                padding: "6px 12px", fontSize: "0.6rem", letterSpacing: "0.1em",
                textTransform: "uppercase", cursor: "pointer", transition: "all 0.15s",
                background: isCurrent ? s.color : isDone ? `${s.color}22` : "transparent",
                border: `1px solid ${isCurrent ? s.color : isDone ? s.color + "44" : "#2a2a2a"}`,
                color: isCurrent ? "#fff" : isDone ? s.color : S.muted,
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        {/* Customer */}
        <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "18px 20px" }}>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, marginBottom: 12 }}>Customer</p>
          {[
            { l: "Company", v: order.company },
            { l: "Contact", v: order.contact },
            { l: "Email", v: order.email },
            { l: "Phone", v: order.phone },
          ].map(({ l, v }) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.7rem", color: S.muted }}>{l}</span>
              <span style={{ fontSize: "0.75rem", color: S.text }}>{v || "—"}</span>
            </div>
          ))}
          {order.quoteId && (
            <Link href={`/admin/quotes/${order.quoteId}`} style={{ textDecoration: "none" }}>
              <p style={{ fontSize: "0.65rem", color: S.accent, marginTop: 10 }}>← From quote</p>
            </Link>
          )}
        </div>

        {/* Profit breakdown */}
        <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "18px 20px" }}>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, marginBottom: 12 }}>Profit Breakdown</p>
          {[
            ...(order.discountPercent > 0 ? [
              { l: "Subtotal", v: `£${order.subtotal.toFixed(2)}`, color: S.muted },
              { l: `Discount (${order.discountPercent}%)`, v: `-£${order.discountAmount.toFixed(2)}`, color: S.danger },
            ] : []),
            { l: "Total Revenue", v: `£${order.totalRevenue.toFixed(2)}`, color: S.text, size: "1rem" },
            { l: "Garment Cost", v: `-£${order.garmentCost.toFixed(2)}`, color: S.danger },
            { l: "Decoration Cost", v: `-£${order.decorationCost.toFixed(2)}`, color: S.danger },
            { l: "Digitising", v: `-£${order.costs.digitisingCost.toFixed(2)}`, color: S.danger },
            { l: "Packaging", v: `-£${order.costs.packagingCost.toFixed(2)}`, color: S.danger },
            { l: "Payment Fee", v: `-£${order.costs.paymentFee.toFixed(2)}`, color: S.danger },
            { l: "Shipping", v: `-£${order.costs.shippingCost.toFixed(2)}`, color: S.danger },
            { l: "Total Cost", v: `£${order.totalJobCost.toFixed(2)}`, color: S.muted },
            { l: "Gross Profit", v: `£${order.grossProfit.toFixed(2)}`, color: order.grossProfit >= 0 ? S.success : S.danger, size: "1rem" },
            { l: "Margin", v: `${order.margin}%`, color: order.margin >= 30 ? S.success : S.warning },
            { l: "Markup", v: `${order.markup}%`, color: S.muted },
          ].map(({ l, v, color, size }) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, padding: l === "Total Revenue" || l === "Gross Profit" ? "4px 0" : undefined, borderTop: l === "Total Cost" ? "1px solid #1a1a1a" : undefined, paddingTop: l === "Total Cost" ? 8 : undefined }}>
              <span style={{ fontSize: "0.7rem", color: S.muted }}>{l}</span>
              <span style={{ fontSize: size ?? "0.8rem", fontWeight: l === "Total Revenue" || l === "Gross Profit" ? 700 : 400, color }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional costs editor */}
      <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "18px 20px", marginBottom: 28 }}>
        <p style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, marginBottom: 14 }}>Adjust Additional Costs</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 14 }}>
          {[
            { label: "Digitising", field: "digitisingCost" },
            { label: "Packaging", field: "packagingCost" },
            { label: "Payment Fee", field: "paymentFee" },
            { label: "Shipping", field: "shippingCost" },
          ].map(({ label, field }) => (
            <div key={field}>
              <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>{label} (£)</label>
              <input
                type="number"
                step="0.01"
                value={(costs as Record<string, number>)[field]}
                onChange={(e) => setCosts({ ...costs, [field]: parseFloat(e.target.value) || 0 })}
                style={{ width: "100%", padding: "8px 10px", background: "#0a0a0a", border: "1px solid #1f1f1f", color: S.text, fontSize: "0.8rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => save({ costs })}
          disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: S.accent, border: "none", color: "#fff", fontSize: "0.68rem", cursor: "pointer" }}
        >
          <Save size={12} /> {saving ? "Recalculating…" : "Recalculate Profit"}
        </button>
      </div>

      {/* Items */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, marginBottom: 12 }}>Order Items</p>
        <div style={{ border: "1px solid #1a1a1a", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a" }}>
                {["Product", "Qty", "Method", "Positions", "Per Unit", "Total"].map((h) => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: S.muted, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: i < order.items.length - 1 ? "1px solid #141414" : "none" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ color: S.text }}>{item.productName}</div>
                    {item.productCode && <div style={{ fontSize: "0.65rem", color: S.muted, fontFamily: "var(--font-jetbrains, monospace)" }}>{item.productCode}</div>}
                  </td>
                  <td style={{ padding: "10px 14px", color: S.muted }}>{item.qty}</td>
                  <td style={{ padding: "10px 14px", color: S.muted, textTransform: "capitalize" }}>{item.method}</td>
                  <td style={{ padding: "10px 14px", color: S.muted, fontSize: "0.72rem" }}>{item.positions.join(", ") || "—"}</td>
                  <td style={{ padding: "10px 14px", color: S.text }}>£{item.totalPerUnit.toFixed(2)}</td>
                  <td style={{ padding: "10px 14px", color: S.accent, fontWeight: 600 }}>£{item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {order.orderNotes && (
        <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "14px 18px" }}>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, marginBottom: 6 }}>Notes</p>
          <p style={{ fontSize: "0.8rem", color: S.muted }}>{order.orderNotes}</p>
        </div>
      )}

      {/* Next step button */}
      {nextStatus && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => save({ status: nextStatus.key })}
            style={{ padding: "10px 20px", background: nextStatus.color, border: "none", color: "#fff", fontSize: "0.7rem", cursor: "pointer" }}
          >
            Advance → {nextStatus.label}
          </button>
        </div>
      )}
    </div>
  );
}
