"use client";

import { BUNDLES } from "@/lib/bundles";

const S = { text: "#F5F5F3", muted: "#777", accent: "#0041F9", success: "#22c55e", border: "#1a1a1a" };

export default function BundlesPage() {
  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 1000 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "2rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1, marginBottom: 6 }}>Bundles</h1>
        <p style={{ fontSize: "0.72rem", color: S.muted }}>{BUNDLES.length} bundles · Edit pricing in lib/bundles.ts then sync to website</p>
      </div>

      {BUNDLES.map((b) => (
        <div key={b.slug} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "24px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontFamily: "var(--font-jetbrains, monospace)", fontSize: "0.65rem", color: S.accent, marginBottom: 4 }}>{b.code}</p>
              <h2 style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "1.4rem", letterSpacing: "0.05em", color: S.text, marginBottom: 4 }}>{b.name}</h2>
              <p style={{ fontSize: "0.72rem", color: S.muted }}>{b.tagline}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 4 }}>Bundle Price</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 700, color: S.accent, lineHeight: 1 }}>£{b.bundlePrice.toFixed(2)}</p>
              <p style={{ fontSize: "0.7rem", color: S.muted, marginTop: 2 }}>Retail: £{b.retailTotal.toFixed(2)}</p>
            </div>
          </div>

          {/* Profit cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Cost Price", value: `£${b.costTotal.toFixed(2)}`, color: S.muted },
              { label: "Bundle Price", value: `£${b.bundlePrice.toFixed(2)}`, color: S.text },
              { label: "Gross Profit", value: `£${b.profit.toFixed(2)}`, color: S.success },
              { label: "Margin", value: `${b.savingPct}%`, color: S.accent },
              { label: "Customer Saving", value: `£${b.saving.toFixed(2)}`, color: "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "#111", border: "1px solid #1a1a1a", padding: "12px 14px" }}>
                <p style={{ fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 5 }}>{label}</p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Items */}
          <div>
            <p style={{ fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 10 }}>Included Items</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {b.lines.map((line) => (
                <div key={line.code} style={{ display: "flex", justifyContent: "space-between", padding: "7px 12px", background: "#111", border: "1px solid #141414" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-jetbrains, monospace)", color: S.accent }}>{line.code}</span>
                    <span style={{ fontSize: "0.78rem", color: S.text }}>{line.name}</span>
                    <span style={{ fontSize: "0.7rem", color: S.muted }}>× {line.qty}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span style={{ fontSize: "0.72rem", color: S.muted }}>Cost: £{(line.cost * line.qty).toFixed(2)}</span>
                    <span style={{ fontSize: "0.72rem", color: S.text }}>Retail: £{(line.retail * line.qty).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {b.choice && (
                <div style={{ padding: "7px 12px", background: "#111", border: "1px solid #141414" }}>
                  <span style={{ fontSize: "0.7rem", color: S.muted }}>+ Customer choice: {b.choice.label} (×{b.choice.qty}) — {b.choice.options.map((o) => o.label).join(" or ")}</span>
                </div>
              )}
              {b.includedBranding && (
                <div style={{ padding: "7px 12px", background: "rgba(0,65,249,0.06)", border: "1px solid rgba(0,65,249,0.2)" }}>
                  <span style={{ fontSize: "0.7rem", color: S.accent }}>✓ {b.includedBranding.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", padding: "16px 20px" }}>
        <p style={{ fontSize: "0.72rem", color: S.muted }}>
          To add or edit bundles, update <code style={{ fontFamily: "var(--font-jetbrains, monospace)", color: S.accent, fontSize: "0.7rem" }}>lib/bundles.ts</code>.
          Bundle pricing auto-recalculates from product costs whenever you save that file.
        </p>
      </div>
    </div>
  );
}
