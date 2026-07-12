"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import type { Product, OrderItem } from "@/lib/admin/types";

const S = { text: "#F5F5F3", muted: "#777", accent: "#0041F9", success: "#22c55e", danger: "#ef4444", border: "#1a1a1a" };

function inputStyle(focus = false): React.CSSProperties {
  return {
    width: "100%", padding: "9px 12px", background: "#0a0a0a",
    border: `1px solid ${focus ? S.accent : "#1f1f1f"}`, color: S.text,
    fontSize: "0.82rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };
}

function blankItem(): Partial<OrderItem> {
  return {
    productCode: "", productName: "", qty: 1,
    method: "embroidery", positions: [],
    basePerUnit: 0, brandingPerUnit: 0, totalPerUnit: 0, lineTotal: 0,
  };
}

// Raw text the user is actively typing for fields that get parsed into
// numbers/arrays (qty, prices, positions). Tracked separately from `items`
// so the <input> always displays exactly what was typed — intermediate
// states like "28.", "Left " (trailing space) or "" never get silently
// rewritten mid-keystroke. That rewrite-on-every-keystroke is what made
// typing feel laggy/fighting and made spaces in "Positions" seem to vanish:
// the old code derived `value` straight from `.trim()`-ed, parsed state, so
// React redrew the input with the "corrected" text right under the user's
// cursor on every change. `items` remains the parsed/derived source of truth
// used for live totals and the save payload — only the display differs now.
type ItemDraft = { qty: string; basePerUnit: string; brandingPerUnit: string; positions: string };

function draftFromItem(item: Partial<OrderItem>): ItemDraft {
  return {
    qty: String(item.qty ?? ""),
    basePerUnit: String(item.basePerUnit ?? ""),
    brandingPerUnit: String(item.brandingPerUnit ?? ""),
    positions: (item.positions ?? []).join(", "),
  };
}

function NewQuoteForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    company: params.get("company") ?? "",
    contact: "", email: "", phone: "", postcode: "", orderNotes: "",
    customerId: params.get("customerId") ?? undefined as string | undefined,
  });
  const [items, setItems] = useState<Partial<OrderItem>[]>([blankItem()]);
  const [itemDrafts, setItemDrafts] = useState<ItemDraft[]>([draftFromItem(blankItem())]);
  const [discountText, setDiscountText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/products").then((r) => r.json()).then(setProducts);
  }, []);

  function updateItem(i: number, patch: Partial<OrderItem>) {
    const next = [...items];
    const merged = { ...next[i], ...patch };
    // Auto-calc line total
    const total = ((merged.basePerUnit ?? 0) + (merged.brandingPerUnit ?? 0)) * (merged.qty ?? 1);
    next[i] = { ...merged, totalPerUnit: (merged.basePerUnit ?? 0) + (merged.brandingPerUnit ?? 0), lineTotal: +total.toFixed(2) };
    setItems(next);
  }

  // Patches the raw-text draft for one item's field — exactly what its <input> displays.
  function patchDraft(i: number, patch: Partial<ItemDraft>) {
    setItemDrafts((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, blankItem()]);
    setItemDrafts((prev) => [...prev, draftFromItem(blankItem())]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    setItemDrafts((prev) => prev.filter((_, idx) => idx !== i));
  }

  function selectProduct(i: number, code: string) {
    const p = products.find((pr) => pr.code === code);
    if (!p) return;
    updateItem(i, {
      productCode: p.code,
      productName: p.name,
      basePerUnit: p.garmentSellPrice,
    });
    patchDraft(i, { basePerUnit: String(p.garmentSellPrice) });
  }

  const totals = items.reduce(
    (acc, item) => ({
      subtotal: acc.subtotal + (item.lineTotal ?? 0),
      cost: acc.cost + ((item.garmentCostPerUnit ?? 0) + (item.decorationCostPerUnit ?? 0)) * (item.qty ?? 1),
    }),
    { subtotal: 0, cost: 0 }
  );
  const pct            = Math.min(100, Math.max(0, parseFloat(discountText) || 0));
  const discountAmount = +(totals.subtotal * (pct / 100)).toFixed(2);
  const totalRevenue   = +(totals.subtotal - discountAmount).toFixed(2);
  const profit         = totalRevenue - totals.cost;
  const margin         = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : "0";

  async function save() {
    if (!form.company) { setError("Company name required"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items, discountPercent: pct }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/quotes/${data.id}`);
    } else {
      setError("Failed to save quote");
    }
  }

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: S.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}>
          <ArrowLeft size={14} /> Back
        </button>
        <h1 style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "1.8rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1 }}>New Quote</h1>
      </div>

      {/* Customer details */}
      <p style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: S.muted, marginBottom: 14 }}>Customer Details</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
        {[
          { label: "Company *", field: "company" },
          { label: "Contact", field: "contact" },
          { label: "Email", field: "email" },
          { label: "Phone", field: "phone" },
          { label: "Postcode", field: "postcode" },
        ].map(({ label, field }) => (
          <div key={field}>
            <label style={{ display: "block", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 5 }}>{label}</label>
            <input
              value={(form as Record<string, string>)[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              style={inputStyle()}
              onFocus={(e) => { e.target.style.borderColor = S.accent; }}
              onBlur={(e) => { e.target.style.borderColor = "#1f1f1f"; }}
            />
          </div>
        ))}
      </div>

      {/* Items */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: S.muted }}>Items</p>
        <button
          onClick={addItem}
          style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", background: "transparent", border: "1px solid #2a2a2a", color: S.muted, fontSize: "0.65rem", cursor: "pointer" }}
        >
          <Plus size={11} /> Add Item
        </button>
      </div>

      {items.map((item, i) => (
        <div key={i} style={{ border: "1px solid #1a1a1a", padding: "16px", marginBottom: 12, background: "#0a0a0a" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 32px", gap: 10, alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Product</label>
              <select
                value={item.productCode}
                onChange={(e) => selectProduct(i, e.target.value)}
                style={{ ...inputStyle(), cursor: "pointer" }}
              >
                <option value="">Select product…</option>
                {products.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
                <option value="_custom">Custom / Other</option>
              </select>
              {item.productCode === "_custom" && (
                <input
                  placeholder="Product name"
                  value={item.productName}
                  onChange={(e) => updateItem(i, { productName: e.target.value })}
                  style={{ ...inputStyle(), marginTop: 6 }}
                />
              )}
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Qty</label>
              <input
                type="number" min={1}
                value={itemDrafts[i]?.qty ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  patchDraft(i, { qty: raw });
                  updateItem(i, { qty: parseInt(raw, 10) || 1 });
                }}
                style={inputStyle()}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Method</label>
              <select value={item.method} onChange={(e) => updateItem(i, { method: e.target.value as OrderItem["method"] })} style={{ ...inputStyle(), cursor: "pointer" }}>
                <option value="embroidery">Embroidery</option>
                <option value="print">Print</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Base/unit (£)</label>
              <input
                type="number" step="0.01"
                value={itemDrafts[i]?.basePerUnit ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  patchDraft(i, { basePerUnit: raw });
                  updateItem(i, { basePerUnit: parseFloat(raw) || 0 });
                }}
                style={inputStyle()}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Branding/unit (£)</label>
              <input
                type="number" step="0.01"
                value={itemDrafts[i]?.brandingPerUnit ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  patchDraft(i, { brandingPerUnit: raw });
                  updateItem(i, { brandingPerUnit: parseFloat(raw) || 0 });
                }}
                style={inputStyle()}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Total</label>
              <div style={{ padding: "9px 12px", background: "#050505", border: "1px solid #1a1a1a", color: S.accent, fontSize: "0.82rem" }}>
                £{(item.lineTotal ?? 0).toFixed(2)}
              </div>
            </div>
            <button onClick={() => removeItem(i)} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", padding: 4, alignSelf: "flex-end", marginBottom: 1 }}>
              <Trash2 size={13} />
            </button>
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Positions (comma-separated)</label>
            <input
              value={itemDrafts[i]?.positions ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                patchDraft(i, { positions: raw });
                updateItem(i, { positions: raw.split(",").map((s) => s.trim()).filter(Boolean) });
              }}
              placeholder="Left Chest, Back"
              style={{ ...inputStyle(), maxWidth: 360 }}
            />
          </div>
        </div>
      ))}

      {/* Discount */}
      <p style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: S.muted, marginBottom: 14 }}>Discount</p>
      <div style={{ border: "1px solid #1a1a1a", padding: "16px", marginBottom: 24, background: "#0a0a0a", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Discount %</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number" min={0} max={100} step="0.5"
              value={discountText}
              onChange={(e) => setDiscountText(e.target.value)}
              placeholder="0"
              style={{ ...inputStyle(), width: 90 }}
              onFocus={(e) => { e.target.style.borderColor = S.accent; }}
              onBlur={(e) => { e.target.style.borderColor = "#1f1f1f"; }}
            />
            <span style={{ fontSize: "0.85rem", color: S.muted }}>%</span>
          </div>
        </div>
        <p style={{ fontSize: "0.68rem", color: S.muted, maxWidth: 320, lineHeight: 1.5 }}>
          e.g. enter <strong style={{ color: S.text }}>20</strong> for 20% off — it&apos;ll be taken straight off the subtotal below, and profit/margin will update to reflect the discounted price.
        </p>
        {pct > 0 && (
          <p style={{ fontSize: "0.78rem", color: S.accent, marginLeft: "auto" }}>
            −£{discountAmount.toFixed(2)} off £{totals.subtotal.toFixed(2)}
          </p>
        )}
      </div>

      {/* Totals summary */}
      <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "16px 20px", marginBottom: 24, display: "flex", gap: 32, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Subtotal</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: pct > 0 ? S.muted : S.text, textDecoration: pct > 0 ? "line-through" : "none" }}>
            £{totals.subtotal.toFixed(2)}
          </p>
        </div>
        {pct > 0 && (
          <div>
            <p style={{ fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Discount ({pct}%)</p>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: S.danger }}>−£{discountAmount.toFixed(2)}</p>
          </div>
        )}
        <div>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Total Revenue</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: S.text }}>£{totalRevenue.toFixed(2)}</p>
        </div>
        <div>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Est. Profit</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: profit >= 0 ? S.success : S.danger }}>£{profit.toFixed(2)}</p>
        </div>
        <div>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Est. Margin</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: S.muted }}>{margin}%</p>
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 6 }}>Order Notes</label>
        <textarea
          value={form.orderNotes}
          onChange={(e) => setForm({ ...form, orderNotes: e.target.value })}
          rows={3}
          style={{ ...inputStyle(), resize: "vertical", maxWidth: 520 }}
        />
      </div>

      {error && <p style={{ fontSize: "0.75rem", color: S.danger, marginBottom: 12 }}>{error}</p>}

      <button onClick={save} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 22px", background: S.accent, border: "none", color: "#fff", fontSize: "0.72rem", cursor: "pointer" }}>
        <Save size={13} /> {saving ? "Saving…" : "Create Quote"}
      </button>
    </div>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense>
      <NewQuoteForm />
    </Suspense>
  );
}
