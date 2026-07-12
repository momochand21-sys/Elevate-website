"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import type { Customer, Quote, Order } from "@/lib/admin/types";

const S = { text: "#F5F5F3", muted: "#777", accent: "#0041F9", success: "#22c55e", danger: "#ef4444", border: "#1a1a1a" };

const ORDER_STATUS_COLORS: Record<string, string> = {
  payment_pending: "#555", paid: "#0041F9", sent_to_supplier: "#06b6d4",
  in_production: "#f59e0b", quality_check: "#8b5cf6", dispatched: "#f97316", completed: "#22c55e",
};

export default function CustomerDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [data, setData] = useState<{ customer: Customer; quotes: Quote[]; orders: Order[] } | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/admin/customers/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setForm(d.customer); });
  }, [id]);

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditing(false);
    setMsg("Saved");
    setTimeout(() => setMsg(""), 3000);
  }

  async function deleteCustomer() {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
    router.push("/admin/customers");
  }

  if (!data) return <div style={{ padding: 48, color: S.muted, fontSize: "0.8rem" }}>Loading…</div>;
  const { customer, quotes, orders } = data;

  const lifetimeRevenue = orders.reduce((s, o) => s + o.totalRevenue, 0);
  const lifetimeProfit = orders.reduce((s, o) => s + o.grossProfit, 0);
  const lastOrder = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const activity = [
    ...quotes.map((q) => ({ kind: "quote" as const, id: q.id, ref: q.reference, amount: q.totalRevenue, status: q.status as string, date: q.createdAt })),
    ...orders.map((o) => ({ kind: "order" as const, id: o.id, ref: o.reference, amount: o.totalRevenue, status: o.status as string, date: o.createdAt })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const inputStyle = (editable: boolean): React.CSSProperties => ({
    width: "100%", padding: "9px 12px", background: editable ? "#0a0a0a" : "transparent",
    border: editable ? "1px solid #1f1f1f" : "1px solid transparent",
    color: editable ? S.text : S.muted, fontSize: "0.85rem",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
    cursor: editable ? "text" : "default",
  });

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36, flexWrap: "wrap" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: S.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}>
          <ArrowLeft size={14} /> Back
        </button>
        <h1 style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "1.8rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1 }}>
          {customer.company}
        </h1>
        {msg && <p style={{ fontSize: "0.72rem", color: S.success }}>{msg}</p>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          {editing ? (
            <>
              <button onClick={save} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: S.accent, border: "none", color: "#fff", fontSize: "0.7rem", cursor: "pointer" }}>
                <Save size={12} /> {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => { setEditing(false); setForm(customer); }} style={{ padding: "9px 16px", background: "transparent", border: "1px solid #2a2a2a", color: S.muted, fontSize: "0.7rem", cursor: "pointer" }}>Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} style={{ padding: "9px 16px", background: "transparent", border: "1px solid #2a2a2a", color: S.muted, fontSize: "0.7rem", cursor: "pointer" }}>Edit</button>
              <button onClick={deleteCustomer} style={{ display: "flex", alignItems: "center", gap: 4, padding: "9px 14px", background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: S.danger, fontSize: "0.7rem", cursor: "pointer" }}>
                <Trash2 size={11} />
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
        {[
          { label: "Contact", field: "contact" },
          { label: "Email", field: "email" },
          { label: "Phone", field: "phone" },
          { label: "Address", field: "address" },
        ].map(({ label, field }) => (
          <div key={field}>
            <p style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, marginBottom: 5 }}>{label}</p>
            <input
              value={(form as Record<string, string>)[field] ?? ""}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              readOnly={!editing}
              style={inputStyle(editing)}
              onFocus={(e) => { if (editing) e.target.style.borderColor = S.accent; }}
              onBlur={(e) => { if (editing) e.target.style.borderColor = "#1f1f1f"; }}
            />
          </div>
        ))}
        <div>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, marginBottom: 5 }}>Logo Status</p>
          {editing ? (
            <select
              value={form.digitisedLogoStatus ?? "none"}
              onChange={(e) => setForm({ ...form, digitisedLogoStatus: e.target.value as Customer["digitisedLogoStatus"] })}
              style={{ ...inputStyle(true), cursor: "pointer" }}
            >
              <option value="none">No Logo</option>
              <option value="pending">Pending Digitising</option>
              <option value="complete">Digitised</option>
            </select>
          ) : (
            <p style={{ fontSize: "0.85rem", color: customer.digitisedLogoStatus === "complete" ? S.success : customer.digitisedLogoStatus === "pending" ? "#f59e0b" : S.muted, padding: "9px 0" }}>
              {{ none: "No Logo", pending: "Pending Digitising", complete: "Digitised" }[customer.digitisedLogoStatus]}
            </p>
          )}
        </div>
        <div>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, marginBottom: 5 }}>Notes</p>
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            readOnly={!editing}
            rows={3}
            style={{ ...inputStyle(editing), resize: "vertical" }}
          />
        </div>
      </div>

      {/* Lifetime stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 32 }}>
        {[
          { l: "Lifetime Revenue", v: `£${lifetimeRevenue.toFixed(2)}`, c: S.text },
          { l: "Lifetime Profit", v: `£${lifetimeProfit.toFixed(2)}`, c: lifetimeProfit >= 0 ? S.success : S.danger },
          { l: "Orders", v: String(orders.length), c: S.text },
          { l: "Quotes", v: String(quotes.length), c: S.text },
          { l: "Last Order", v: lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString("en-GB") : "—", c: S.text },
          { l: "Current Status", v: lastOrder ? lastOrder.status.replace(/_/g, " ") : "—", c: lastOrder ? (ORDER_STATUS_COLORS[lastOrder.status] ?? S.muted) : S.muted },
        ].map(({ l, v, c }) => (
          <div key={l} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "14px 16px" }}>
            <p style={{ fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 6 }}>{l}</p>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: c, textTransform: l === "Current Status" ? "capitalize" : "none" }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Activity timeline */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: S.muted }}>Activity Timeline</p>
          <Link href={`/admin/quotes/new?company=${encodeURIComponent(customer.company)}&customerId=${customer.id}`}>
            <button style={{ padding: "5px 12px", background: "transparent", border: "1px solid #2a2a2a", color: S.muted, fontSize: "0.65rem", cursor: "pointer" }}>+ New Quote</button>
          </Link>
        </div>
        {activity.length > 0 ? (
          <div style={{ borderLeft: "1px solid #1f1f1f", marginLeft: 6 }}>
            {activity.map((a) => {
              const color = a.kind === "order" ? (ORDER_STATUS_COLORS[a.status] ?? "#8b5cf6") : S.accent;
              const href = a.kind === "order" ? `/admin/orders/${a.id}` : `/admin/quotes/${a.id}`;
              const tagColor = a.kind === "order" ? "#8b5cf6" : S.accent;
              return (
                <Link key={`${a.kind}-${a.id}`} href={href} style={{ textDecoration: "none" }}>
                  <div style={{ position: "relative", paddingLeft: 22, paddingBottom: 18, cursor: "pointer" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                  >
                    <span style={{ position: "absolute", left: -5, top: 3, width: 9, height: 9, borderRadius: "50%", background: color, border: "2px solid #030303" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: tagColor, border: `1px solid ${tagColor}55`, padding: "1px 6px" }}>{a.kind}</span>
                      <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-jetbrains, monospace)", color: S.text }}>{a.ref}</span>
                      <span style={{ fontSize: "0.72rem", color: S.text }}>£{a.amount.toFixed(2)}</span>
                      <span style={{ fontSize: "0.6rem", color, textTransform: "capitalize", letterSpacing: "0.06em" }}>{a.status.replace(/_/g, " ")}</span>
                      <span style={{ fontSize: "0.68rem", color: S.muted, marginLeft: "auto" }}>{new Date(a.date).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : <p style={{ fontSize: "0.75rem", color: S.muted }}>No activity yet</p>}
      </div>
    </div>
  );
}
