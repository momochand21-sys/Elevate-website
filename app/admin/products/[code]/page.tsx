"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, RefreshCw } from "lucide-react";
import type { Product } from "@/lib/admin/types";

const S = {
  text: "#F5F5F3", muted: "#777", accent: "#0041F9",
  card: "#111", border: "#1a1a1a", success: "#22c55e",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: S.muted, marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text" }: { value: string | number; onChange: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", padding: "10px 12px", background: "#0a0a0a",
        border: "1px solid #1f1f1f", color: S.text, fontSize: "0.85rem",
        outline: "none", fontFamily: "inherit", boxSizing: "border-box",
      }}
      onFocus={(e) => { e.target.style.borderColor = S.accent; }}
      onBlur={(e) => { e.target.style.borderColor = "#1f1f1f"; }}
    />
  );
}

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const isNew = code === "new";

  const [product, setProduct] = useState<Partial<Product>>({
    code: "", name: "", category: "", garmentCost: 0, garmentSellPrice: 0,
    brandingPositions: [], sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    active: true, volumeTiers: [], decorationCosts: {}, decorationSellPrices: {},
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/products/${code}`)
        .then((r) => r.json())
        .then(setProduct);
    }
  }, [code, isNew]);

  async function save(syncWebsite = false) {
    setSaving(true);
    const body = { ...product, syncWebsite };
    const res = await fetch(
      isNew ? "/api/admin/products" : `/api/admin/products/${code}`,
      {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setProduct(data);
      setMsg(syncWebsite ? "Saved & synced to website" : "Saved");
      setTimeout(() => setMsg(""), 3000);
      if (isNew) router.push(`/admin/products/${data.code}`);
    }
  }

  async function syncNow() {
    setSyncing(true);
    await save(true);
    setSyncing(false);
  }

  const marginPct =
    product.garmentSellPrice && product.garmentCost
      ? (((product.garmentSellPrice - product.garmentCost) / product.garmentSellPrice) * 100).toFixed(1)
      : "—";

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", color: S.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h1 style={{
          fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
          fontSize: "1.8rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1,
        }}>
          {isNew ? "New Product" : product.name ?? code}
        </h1>
        {msg && <p style={{ fontSize: "0.72rem", color: S.success, marginLeft: "auto" }}>{msg}</p>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {/* Left */}
        <div>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: S.muted, marginBottom: 16 }}>Product Details</p>
          <Field label="Product Code">
            <Input value={product.code ?? ""} onChange={(v) => setProduct({ ...product, code: v })} />
          </Field>
          <Field label="Product Name">
            <Input value={product.name ?? ""} onChange={(v) => setProduct({ ...product, name: v })} />
          </Field>
          <Field label="Category">
            <Input value={product.category ?? ""} onChange={(v) => setProduct({ ...product, category: v })} />
          </Field>
          <Field label="Sizes (comma-separated)">
            <Input
              value={(product.sizes ?? []).join(", ")}
              onChange={(v) => setProduct({ ...product, sizes: v.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
          </Field>
          <Field label="Branding Positions (comma-separated)">
            <Input
              value={(product.brandingPositions ?? []).join(", ")}
              onChange={(v) => setProduct({ ...product, brandingPositions: v.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
          </Field>
          <Field label="Status">
            <select
              value={product.active ? "active" : "inactive"}
              onChange={(e) => setProduct({ ...product, active: e.target.value === "active" })}
              style={{
                width: "100%", padding: "10px 12px", background: "#0a0a0a",
                border: "1px solid #1f1f1f", color: S.text, fontSize: "0.85rem",
                outline: "none", fontFamily: "inherit",
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
        </div>

        {/* Right */}
        <div>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: S.muted, marginBottom: 16 }}>Pricing</p>

          <Field label="Garment Cost Price (£)">
            <Input type="number" value={product.garmentCost ?? 0} onChange={(v) => setProduct({ ...product, garmentCost: parseFloat(v) || 0 })} />
          </Field>
          <Field label="Garment Sell Price (£)">
            <Input type="number" value={product.garmentSellPrice ?? 0} onChange={(v) => setProduct({ ...product, garmentSellPrice: parseFloat(v) || 0 })} />
          </Field>

          {/* Margin indicator */}
          <div style={{
            background: "#0a0a0a", border: "1px solid #1a1a1a",
            padding: "12px 16px", marginBottom: 20,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: "0.7rem", color: S.muted }}>Garment margin</span>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: S.accent }}>{marginPct}%</span>
          </div>

          <p style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: S.muted, marginBottom: 12 }}>
            Volume Tier Sell Prices
          </p>
          {(product.volumeTiers ?? []).map((tier, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <span style={{ fontSize: "0.7rem", color: S.muted, minWidth: 120 }}>
                {tier.min}–{tier.max === 999999 ? "∞" : tier.max} units
              </span>
              <div style={{ flex: 1 }}>
                <Input
                  type="number"
                  value={tier.price}
                  onChange={(v) => {
                    const tiers = [...(product.volumeTiers ?? [])];
                    tiers[i] = { ...tiers[i], price: parseFloat(v) || 0 };
                    setProduct({ ...product, volumeTiers: tiers });
                  }}
                />
              </div>
              <span style={{ fontSize: "0.7rem", color: S.muted, minWidth: 20 }}>£</span>
            </div>
          ))}
        </div>
      </div>

      {/* Decoration pricing table */}
      <div style={{ marginTop: 32 }}>
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: S.muted, marginBottom: 16 }}>
          Decoration Prices Per Position
        </p>
        <div style={{ border: "1px solid #1a1a1a", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a" }}>
                {["Position", "Emb. Cost", "Emb. Sell", "Print Cost", "Print Sell"].map((h) => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: S.muted, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(product.brandingPositions ?? []).map((pos, i) => {
                const cost = product.decorationCosts?.[pos] ?? { embroidery: 0, print: 0 };
                const sell = product.decorationSellPrices?.[pos] ?? { embroidery: 0, print: 0 };
                return (
                  <tr key={pos} style={{ borderBottom: i < (product.brandingPositions?.length ?? 0) - 1 ? "1px solid #141414" : "none" }}>
                    <td style={{ padding: "8px 14px", color: S.text }}>{pos}</td>
                    {[
                      { section: "decorationCosts", key: "embroidery" },
                      { section: "decorationSellPrices", key: "embroidery" },
                      { section: "decorationCosts", key: "print" },
                      { section: "decorationSellPrices", key: "print" },
                    ].map(({ section, key }) => (
                      <td key={`${section}-${key}`} style={{ padding: "6px 14px" }}>
                        <input
                          type="number"
                          step="0.01"
                          value={(section === "decorationCosts" ? cost : sell)[key as "embroidery" | "print"]}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const s = section as "decorationCosts" | "decorationSellPrices";
                            setProduct({
                              ...product,
                              [s]: {
                                ...(product[s] ?? {}),
                                [pos]: { ...(product[s]?.[pos] ?? {}), [key]: val },
                              },
                            });
                          }}
                          style={{
                            width: 72, padding: "5px 8px", background: "#0a0a0a",
                            border: "1px solid #1f1f1f", color: S.text,
                            fontSize: "0.78rem", outline: "none",
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <button
          onClick={() => save(false)}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "11px 20px", background: S.accent, border: "none",
            color: "#fff", fontSize: "0.72rem", cursor: "pointer",
          }}
        >
          <Save size={13} /> {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={syncNow}
          disabled={syncing || saving}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "11px 20px", background: "transparent",
            border: "1px solid #2a2a2a", color: S.muted,
            fontSize: "0.72rem", cursor: "pointer",
          }}
        >
          <RefreshCw size={13} /> {syncing ? "Syncing…" : "Save & Sync to Website"}
        </button>
      </div>
    </div>
  );
}
