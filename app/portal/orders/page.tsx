"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { DUMMY_ORDERS, ORDER_STATUS_COLOUR, ORDER_STATUS_LABEL, type Order, type OrderItem } from "@/lib/portal-data";
import { useBasket } from "@/lib/basket-context";
import { orderToBasketItems } from "@/lib/reorder-utils";

const PRODUCT_IMAGE: Record<string, string> = {
  polo:          "/products/polo-360/polo-000.png",
  hoodie:        "/products/360/hoodie-000.png",
  gilet:         "/products/gilet-360/gilet-front-final-v3.png",
  "quarter zip": "/products/quarter-zip-360/quarter-zip-000.png",
  "1/4 zip":     "/products/quarter-zip-360/quarter-zip-000.png",
  "¼zip":        "/products/quarter-zip-360/quarter-zip-000.png",
  cap:           "/products/cap-360/cap-000.png",
  beanie:        "/products/beanie-360/beanie-000.png",
};

function resolveProductImage(productName: string): string | null {
  const lower = productName.toLowerCase();
  for (const [key, path] of Object.entries(PRODUCT_IMAGE)) {
    if (lower.includes(key)) return path;
  }
  return null;
}

function OrderItemsPreview({ items }: { items: OrderItem[] }) {
  const images = items
    .filter(i => i.qty > 0)
    .map(i => ({ src: resolveProductImage(i.product), label: i.product, qty: i.qty }))
    .filter(i => i.src !== null) as { src: string; label: string; qty: number }[];

  if (images.length === 0) return null;

  const shown = images.slice(0, 4);
  const extra = images.length - shown.length;

  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
      {shown.map((img, i) => (
        <div
          key={img.src + i}
          title={`${img.qty}× ${img.label}`}
          style={{
            width: 40, height: 40,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "#111118",
            overflow: "hidden",
            flexShrink: 0,
            marginLeft: i === 0 ? 0 : -8,
            position: "relative",
            zIndex: shown.length - i,
          }}
        >
          <Image src={img.src} alt={img.label} fill sizes="40px" style={{ objectFit: "cover", objectPosition: "top center", filter: "brightness(0.92)" }} />
        </div>
      ))}
      {extra > 0 && (
        <div style={{
          width: 40, height: 40, marginLeft: -8, flexShrink: 0,
          background: "rgba(0,65,249,0.15)", border: "1px solid rgba(0,65,249,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.48rem",
          color: "rgba(0,65,249,0.8)", letterSpacing: "0.06em",
        }}>
          +{extra}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const colour = ORDER_STATUS_COLOUR[status];
  return (
    <span style={{ padding:"3px 10px", background:`${colour}16`, border:`1px solid ${colour}40`, color:colour, fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.12em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export default function OrdersPage() {
  const [selected, setSelected] = useState<Order | null>(null);
  const [reordered, setReordered] = useState<string | null>(null);
  const basket = useBasket();
  const router = useRouter();

  const handleReorder = (order: Order, andNavigate = false) => {
    const basketItems = orderToBasketItems(order);
    basket.addItems(basketItems);
    setReordered(order.id);
    if (andNavigate) router.push("/basket");
  };

  return (
    <div style={{ padding:"64px 48px 48px", maxWidth:1100 }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(0,65,249,0.7)", marginBottom:4 }}>Client Portal</p>
        <h1 style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"2.2rem", letterSpacing:"0.04em", color:"#F5F5F3", lineHeight:1 }}>Previous Orders</h1>
      </div>

      {/* Reordered banner */}
      {reordered && (
        <div style={{ marginBottom:16, padding:"12px 16px", border:"1px solid rgba(0,65,249,0.35)", background:"rgba(0,65,249,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.7)" }}>
            ✓ Added to basket — quantities and branding carried over
          </p>
          <Link href="/basket" style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#0041F9", textDecoration:"none", flexShrink:0 }}>
            View Basket →
          </Link>
        </div>
      )}

      {/* Orders table */}
      <div style={{ border:"1px solid rgba(255,255,255,0.06)", background:"rgba(10,10,16,0.6)" }}>
        {/* Table header */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 100px 120px 100px 90px 140px", gap:0, padding:"10px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
          {["Product","Qty","Method","Positions","Date","Total","Actions"].map(h => (
            <p key={h} style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>{h}</p>
          ))}
        </div>

        {/* Rows */}
        {[...DUMMY_ORDERS].reverse().map(order => (
          <div key={order.id} style={{ display:"grid", gridTemplateColumns:"1fr 80px 100px 120px 100px 90px 140px", gap:0, padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.04)", alignItems:"center", transition:"background 0.15s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.025)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";}}>
            <div>
              <OrderItemsPreview items={order.items} />
              <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.82rem", color:"rgba(255,255,255,0.7)", marginBottom:2 }}>{order.product}</p>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>{order.ref}</p>
                <StatusBadge status={order.status}/>
              </div>
            </div>
            <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.82rem", color:"rgba(255,255,255,0.55)" }}>{order.qty}</p>
            <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.45)" }}>{order.method}</p>
            <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.38)" }}>{order.positions.join(", ")}</p>
            <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", color:"rgba(255,255,255,0.38)" }}>{order.date}</p>
            <p style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1rem", letterSpacing:"0.04em", color:"#F5F5F3" }}>£{order.total.toFixed(2)}</p>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>setSelected(order)} style={{ padding:"5px 10px", border:"1px solid rgba(0,65,249,0.45)", background:"transparent", cursor:"pointer", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(0,65,249,0.8)", transition:"all 0.15s" }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(0,65,249,0.12)";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";}}>
                View
              </button>
              <button
                onClick={() => handleReorder(order)}
                style={{ padding:"5px 10px", border:`1px solid ${reordered===order.id?"rgba(74,222,128,0.5)":"rgba(255,255,255,0.1)"}`, background: reordered===order.id?"rgba(74,222,128,0.08)":"transparent", cursor:"pointer", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.48rem", letterSpacing:"0.1em", textTransform:"uppercase", color: reordered===order.id?"#4ade80":"rgba(255,255,255,0.4)", transition:"all 0.15s" }}
                onMouseEnter={e=>{ if(reordered!==order.id) (e.currentTarget as HTMLElement).style.color="#fff"; }}
                onMouseLeave={e=>{ if(reordered!==order.id) (e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.4)"; }}>
                {reordered === order.id ? "✓ Added" : "Reorder"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={()=>setSelected(null)}>
          <div style={{ background:"#0A0A0E", border:"1px solid rgba(255,255,255,0.08)", maxWidth:540, width:"100%", padding:"32px" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(0,65,249,0.7)", marginBottom:4 }}>Order Detail</p>
                <h2 style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.6rem", letterSpacing:"0.05em", color:"#F5F5F3", lineHeight:1 }}>{selected.ref}</h2>
              </div>
              <button onClick={()=>setSelected(null)} style={{ cursor:"pointer", color:"rgba(255,255,255,0.4)", background:"none", border:"none", fontSize:"1.2rem" }}>✕</button>
            </div>

            {/* Size breakdown */}
            <div style={{ marginBottom:16, padding:"10px 14px", border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>
              <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", marginBottom:8 }}>Size Breakdown</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {Object.entries(selected.sizes).map(([size, qty]) => (
                  <span key={size} style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"#fff", background:"rgba(0,65,249,0.15)", border:"1px solid rgba(0,65,249,0.3)", padding:"3px 9px" }}>
                    {qty}× {size}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                ["Product",     selected.product],
                ["Branding",    selected.method],
                ["Positions",   selected.positions.join(", ")],
                ["Logo Used",   selected.logoAsset],
                ["Date",        selected.date],
                ["Status",      ORDER_STATUS_LABEL[selected.status]],
                ["Total",       `£${selected.total.toFixed(2)}`],
                ...(selected.tracking ? [["Tracking", selected.tracking]] : []),
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", paddingBottom:10, borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>{k}</span>
                  <span style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.82rem", color:"rgba(255,255,255,0.6)", textAlign:"right", maxWidth:"60%" }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop:20, display:"flex", gap:10 }}>
              <button
                onClick={() => { handleReorder(selected, true); setSelected(null); }}
                style={{ flex:1, padding:"12px", background:"#0041F9", border:"none", textAlign:"center", cursor:"pointer", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.58rem", letterSpacing:"0.16em", textTransform:"uppercase", color:"#fff" }}>
                Add to Basket &amp; Go →
              </button>
              <button onClick={()=>setSelected(null)} style={{ flex:1, padding:"12px", border:"1px solid rgba(255,255,255,0.1)", background:"transparent", cursor:"pointer", fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.58rem", letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
