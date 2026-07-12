"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DUMMY_QUOTES, QUOTE_STATUS_COLOUR, QUOTE_STATUS_LABEL, type Quote } from "@/lib/portal-data";
import { useBasket } from "@/lib/basket-context";
import { PRODUCT_META } from "@/lib/reorder-utils";

const ALL_STATUSES = ["all", "pending", "approved", "awaiting-artwork", "completed", "rejected"] as const;

export default function QuotesPage() {
  const [filter, setFilter] = useState<"all" | Quote["status"]>("all");
  const [reordered, setReordered] = useState<string | null>(null);
  const basket = useBasket();
  const router = useRouter();

  const handleReorder = (quote: Quote) => {
    const meta = PRODUCT_META[quote.product] ?? { code:"ELV-???", href:"/products" };
    console.log("REORDER CLICKED", quote.id, quote.product);
    basket.addItem({
      productName:  quote.product,
      productCode:  meta.code,
      productHref:  meta.href,
      totalQty:     quote.qty,
      logo:         "yes",
      method:       quote.method as "embroidery"|"print"|"both",
      positions:    [...quote.positions],
      notes:        quote.notes,
      basePerUnit:  +(quote.total / quote.qty).toFixed(2),
      brandingCost: 0,
      totalPerUnit: +(quote.total / quote.qty).toFixed(2),
      totalOrder:   quote.total,
    });
    setReordered(quote.id);
    router.push("/basket");
  };

  const filtered = filter === "all" ? DUMMY_QUOTES : DUMMY_QUOTES.filter(q => q.status === filter);

  return (
    <div style={{ padding:"32px 40px", maxWidth:1100 }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(0,65,249,0.7)", marginBottom:4 }}>Client Portal</p>
        <h1 style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"2.2rem", letterSpacing:"0.04em", color:"#F5F5F3", lineHeight:1 }}>Quotes</h1>
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:24, flexWrap:"wrap" }}>
        {ALL_STATUSES.map(s => {
          const active = filter === s;
          const colour = s === "all" ? "#0041F9" : QUOTE_STATUS_COLOUR[s as Quote["status"]];
          return (
            <button key={s} onClick={() => setFilter(s as typeof filter)}
              style={{
                padding:"6px 14px", cursor:"pointer", transition:"all 0.15s",
                fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem",
                letterSpacing:"0.12em", textTransform:"uppercase",
                color: active ? "#fff" : "rgba(255,255,255,0.38)",
                background: active ? `${colour}22` : "transparent",
                border: `1px solid ${active ? colour : "rgba(255,255,255,0.08)"}`,
              }}>
              {s === "all" ? "All" : QUOTE_STATUS_LABEL[s as Quote["status"]]}
              {s !== "all" && (
                <span style={{ marginLeft:6, opacity:0.6 }}>
                  {DUMMY_QUOTES.filter(q => q.status === s).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quotes list */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.length === 0 && (
          <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.22)", padding:"32px 0" }}>
            No quotes in this category.
          </p>
        )}
        {[...filtered].reverse().map(quote => {
          const sc = QUOTE_STATUS_COLOUR[quote.status];
          return (
            <div key={quote.id} style={{ padding:"18px 24px", background:"rgba(10,10,16,0.7)", border:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", flexWrap:"wrap", gap:20, borderLeft:`3px solid ${sc}` }}>
              <div style={{ minWidth:120 }}>
                <p style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1rem", letterSpacing:"0.06em", color:"#F5F5F3", marginBottom:2 }}>{quote.ref}</p>
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>{quote.date}</p>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.85rem", color:"rgba(255,255,255,0.65)", marginBottom:2 }}>{quote.product}</p>
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.32)" }}>
                  {quote.qty} units · {quote.method} · {quote.positions.join(", ")}
                </p>
                {quote.notes && <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.75rem", color:"rgba(255,255,255,0.28)", marginTop:3 }}>{quote.notes}</p>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.2rem", letterSpacing:"0.04em", color:"#F5F5F3" }}>£{quote.total.toFixed(2)}</p>
                  <span style={{ padding:"2px 8px", background:`${sc}16`, border:`1px solid ${sc}40`, color:sc, fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                    {QUOTE_STATUS_LABEL[quote.status]}
                  </span>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {(quote.status === "approved" || quote.status === "completed") && (
                    <button
                      type="button"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); handleReorder(quote); }}
                      style={{ padding:"7px 14px", background: reordered===quote.id?"rgba(74,222,128,0.15)":"#0041F9", border: reordered===quote.id?"1px solid rgba(74,222,128,0.5)":"none", cursor:"pointer", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", color: reordered===quote.id?"#4ade80":"#fff", whiteSpace:"nowrap", transition:"all 0.15s" }}>
                      {reordered === quote.id ? "✓ Added" : "Reorder"}
                    </button>
                  )}
                  {quote.status === "pending" && (
                    <span style={{ padding:"7px 14px", border:"1px solid rgba(255,255,255,0.1)", cursor:"pointer", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)", whiteSpace:"nowrap" }}>
                      View
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop:28 }}>
        <Link href="/products">
          <span style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", background:"#0041F9", cursor:"pointer", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"#fff" }}>
            + Request New Quote
          </span>
        </Link>
      </div>
    </div>
  );
}
