"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePortal } from "@/components/portal/PortalProvider";
import { DUMMY_ORDERS, DUMMY_LOGOS, ORDER_STATUS_COLOUR, ORDER_STATUS_LABEL } from "@/lib/portal-data";
import { useBasket } from "@/lib/basket-context";
import { orderToBasketItems } from "@/lib/reorder-utils";

export default function PortalDashboard() {
  const { customer } = usePortal();
  const [copiedLogo, setCopiedLogo] = useState<string | null>(null);
  const [reordered, setReordered] = useState<string | null>(null);
  const basket = useBasket();
  const router = useRouter();

  const handleReorder = (order: typeof DUMMY_ORDERS[0]) => {
    const basketItems = orderToBasketItems(order);
    basket.addItems(basketItems);
    setReordered(order.id);
    router.push("/basket");
  };

  if (!customer) return null;

  return (
    <div style={{ padding: "64px 48px 48px", maxWidth: 1080 }}>

      {/* ── Greeting ── */}
      <div style={{ marginBottom: 48 }}>
        <p style={{
          fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem",
          letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(0,65,249,0.65)", marginBottom: 8,
        }}>
          Welcome back
        </p>
        <h1 style={{
          fontFamily: "var(--font-bebas,'Bebas Neue')",
          fontSize: "clamp(2rem,4vw,3rem)", letterSpacing: "0.04em",
          color: "#F5F5F3", lineHeight: 1, marginBottom: 0,
        }}>
          {customer.company}
        </h1>
      </div>

      {/* ══════════════════════════════════════
          1. START NEW ORDER  — primary CTA
      ══════════════════════════════════════ */}
      <Link href="/products/hoodies/heavyweight-hoodie">
        <div style={{
          width: "100%", padding: "22px 32px",
          background: "#0041F9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", marginBottom: 56, transition: "background 0.2s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#0035CC"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#0041F9"; }}
        >
          <div>
            <p style={{
              fontFamily: "var(--font-bebas,'Bebas Neue')",
              fontSize: "1.5rem", letterSpacing: "0.06em", color: "#fff", lineHeight: 1,
            }}>
              Start New Order
            </p>
            <p style={{
              fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem",
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)", marginTop: 4,
            }}>
              Build a quote or buy now
            </p>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10H16M10 4L16 10L10 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </Link>

      {/* ══════════════════════════════════════
          2. REORDER PREVIOUS ORDERS
      ══════════════════════════════════════ */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
          <h2 style={{
            fontFamily: "var(--font-bebas,'Bebas Neue')",
            fontSize: "1.3rem", letterSpacing: "0.05em", color: "#F5F5F3",
          }}>
            Previous Orders
          </h2>
          <Link href="/portal/orders">
            <span style={{
              fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem",
              letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
              cursor: "pointer", transition: "color 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"; }}
            >
              View All →
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...DUMMY_ORDERS].reverse().map(order => {
            const sc = ORDER_STATUS_COLOUR[order.status];
            return (
              <div key={order.id} style={{
                background: "rgba(10,10,16,0.8)",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex", flexDirection: "column",
                overflow: "hidden",
              }}>
                {/* Product image collage */}
                <div style={{
                  position: "relative", height: 160,
                  background: "rgba(14,14,20,0.9)",
                  display: "flex", alignItems: "stretch",
                  gap: 0, overflow: "hidden",
                }}>
                  {(() => {
                    const PRODUCT_IMAGE: Record<string, string> = {
                      polo:           "/products/polo-360/polo-000.png",
                      hoodie:         "/products/360/hoodie-000.png",
                      gilet:          "/products/gilet-360/gilet-front-final-v3.png",
                      "quarter zip":  "/products/quarter-zip-360/quarter-zip-000.png",
                      "1/4 zip":      "/products/quarter-zip-360/quarter-zip-000.png",
                      "¼zip":         "/products/quarter-zip-360/quarter-zip-000.png",
                      cap:            "/products/cap-360/cap-000.png",
                      beanie:         "/products/beanie-360/beanie-000.png",
                    };
                    const imgs = order.items
                      .filter(i => i.qty > 0)
                      .map(i => {
                        const lower = i.product.toLowerCase();
                        const src = Object.entries(PRODUCT_IMAGE).find(([k]) => lower.includes(k))?.[1] ?? null;
                        return src ? { src, label: i.product, qty: i.qty } : null;
                      })
                      .filter(Boolean) as { src: string; label: string; qty: number }[];
                    const shown = imgs.slice(0, 3);
                    const pct = `${100 / (shown.length || 1)}%`;
                    return shown.map((img, i) => (
                      <div key={img.src + i} title={`${img.qty}× ${img.label}`} style={{
                        position: "relative", width: pct, height: "100%", flexShrink: 0,
                        padding: "12px 8px",
                      }}>
                        <Image src={img.src} alt={img.label} fill sizes="33vw"
                          style={{ objectFit: "contain", objectPosition: "center", filter: "brightness(1.1)", padding: "12px 8px" }} />
                      </div>
                    ));
                  })()}
                  {/* Status badge */}
                  <div style={{
                    position: "absolute", top: 10, right: 10,
                    padding: "3px 8px",
                    background: `${sc}18`, border: `1px solid ${sc}40`,
                  }}>
                    <span style={{
                      fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.44rem",
                      letterSpacing: "0.1em", textTransform: "uppercase", color: sc,
                    }}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <p style={{
                      fontFamily: "var(--font-dm-sans,sans-serif)",
                      fontSize: "0.88rem", color: "rgba(255,255,255,0.8)", fontWeight: 500, marginBottom: 4,
                    }}>
                      {order.product}
                    </p>
                    <p style={{
                      fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.48rem",
                      letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
                    }}>
                      {order.qty} units · {order.date} · {order.ref}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {Object.entries(order.sizes).map(([sz, qty]) => (
                      <span key={sz} style={{
                        padding: "2px 8px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.46rem",
                        letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
                      }}>
                        {sz} × {qty}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); handleReorder(order); }}
                    style={{
                      marginTop: "auto", width: "100%", padding: "10px", textAlign: "center",
                      border: `1px solid ${reordered===order.id?"rgba(74,222,128,0.5)":"rgba(0,65,249,0.45)"}`,
                      background: reordered===order.id?"rgba(74,222,128,0.08)":"transparent",
                      cursor: "pointer", transition: "all 0.15s",
                      fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.54rem",
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: reordered===order.id?"#4ade80":"rgba(0,65,249,0.85)",
                    }}
                    onMouseEnter={e => { if(reordered!==order.id)(e.currentTarget as HTMLElement).style.background="rgba(0,65,249,0.12)"; }}
                    onMouseLeave={e => { if(reordered!==order.id)(e.currentTarget as HTMLElement).style.background="transparent"; }}
                  >
                    {reordered === order.id ? "✓ Added" : "Reorder"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════
          3. SAVED LOGOS
      ══════════════════════════════════════ */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
          <h2 style={{
            fontFamily: "var(--font-bebas,'Bebas Neue')",
            fontSize: "1.3rem", letterSpacing: "0.05em", color: "#F5F5F3",
          }}>
            Saved Logos
          </h2>
          <Link href="/portal/logos">
            <span style={{
              fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.5rem",
              letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
              cursor: "pointer", transition: "color 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"; }}
            >
              Manage →
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DUMMY_LOGOS.map(logo => (
            <div key={logo.id} style={{
              background: "rgba(10,10,16,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "20px",
              display: "flex", flexDirection: "column", gap: 14,
            }}>
              {/* Logo icon */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, flexShrink: 0,
                  background: "rgba(0,65,249,0.1)", border: "1px solid rgba(0,65,249,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem",
                    letterSpacing: "0.06em", color: "#0041F9",
                  }}>
                    {logo.fileType}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: "var(--font-dm-sans,sans-serif)", fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.8)", fontWeight: 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {logo.name}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <span style={{
                      fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.44rem",
                      letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
                    }}>
                      {logo.fileSize}
                    </span>
                    {logo.approved && (
                      <span style={{
                        padding: "1px 6px",
                        background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
                        fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.4rem",
                        letterSpacing: "0.1em", textTransform: "uppercase", color: "#22c55e",
                      }}>
                        Approved
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6 }}>
                <Link href="/products/hoodies/heavyweight-hoodie" style={{ flex: 1 }}>
                  <div style={{
                    padding: "8px", textAlign: "center",
                    background: "rgba(0,65,249,0.1)", border: "1px solid rgba(0,65,249,0.35)",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,65,249,0.2)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,65,249,0.1)"; }}
                  >
                    <span style={{
                      fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.48rem",
                      letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,65,249,0.9)",
                    }}>
                      Use
                    </span>
                  </div>
                </Link>
                <button
                  title="Download"
                  style={{
                    padding: "8px 12px", border: "1px solid rgba(255,255,255,0.08)",
                    background: "transparent", cursor: "pointer", transition: "all 0.15s",
                    color: "rgba(255,255,255,0.35)",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 1v8M3.5 6l3 3 3-3M1 10.5v.5A1 1 0 002 12h9a1 1 0 001-1v-.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  title="Delete"
                  style={{
                    padding: "8px 12px", border: "1px solid rgba(255,255,255,0.08)",
                    background: "transparent", cursor: "pointer", transition: "all 0.15s",
                    color: "rgba(255,255,255,0.25)",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,0.3)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 3.5h9M5 3.5V2h3v1.5M4 3.5l.5 7h4l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Upload new logo */}
          <Link href="/portal/logos">
            <div style={{
              border: "1px dashed rgba(255,255,255,0.1)",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 8, padding: 28, cursor: "pointer",
              minHeight: 130, transition: "all 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,65,249,0.45)"; (e.currentTarget as HTMLElement).style.background = "rgba(0,65,249,0.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.18)" }}>+</span>
              <p style={{
                fontFamily: "var(--font-jetbrains,monospace)", fontSize: "0.52rem",
                letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
              }}>
                Upload Logo
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
