"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBasket } from "@/lib/basket-context";
import type { BasketItem } from "@/lib/basket-context";
import { basketQualifiesForCheckout, checkoutStatusMessage } from "@/lib/basket-rules";

/* ─────────────────────────────────────────────────────────────────
   ITEM ROW
───────────────────────────────────────────────────────────────── */
function ItemRow({ item, onRemove }: { item: BasketItem; onRemove: () => void }) {
  const sizeBreakdown = item.sizeQtys
    ? Object.entries(item.sizeQtys)
        .filter(([, q]) => q > 0)
        .map(([s, q]) => `${q}×${s}`)
        .join("  ")
    : item.qty
    ? `${item.qty} units`
    : "";

  const brandingLabel =
    item.logo === "no"
      ? "No branding"
      : item.method === "embroidery"
      ? "Embroidery"
      : item.method === "print"
      ? "Print"
      : item.method === "both"
      ? "Embroidery + Print"
      : "Branded";

  return (
    <div
      className="flex flex-col gap-2.5 py-4"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Top row: name + remove */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p
            style={{
              fontFamily: "var(--font-bebas,'Bebas Neue')",
              fontSize: "1.05rem",
              letterSpacing: "0.05em",
              color: "#F5F5F3",
              lineHeight: 1,
            }}
          >
            {item.productName}
          </p>
          <p
            style={{
              fontFamily: "var(--font-jetbrains,monospace)",
              fontSize: "0.48rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(0,65,249,0.75)",
            }}
          >
            {item.productCode}
          </p>
        </div>
        <button
          onClick={onRemove}
          style={{
            flexShrink: 0,
            color: "rgba(255,255,255,0.25)",
            fontSize: "0.85rem",
            cursor: "pointer",
            padding: "2px 4px",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)"; }}
          aria-label="Remove item"
        >
          ×
        </button>
      </div>

      {/* Bundle contents breakdown */}
      {item.isBundle && item.bundleContents && (
        <div className="flex flex-col gap-1">
          {item.bundleContents.map((c, i) => {
            const sizes = c.sizeQtys
              ? Object.entries(c.sizeQtys).filter(([, q]) => q > 0).map(([s, q]) => `${q}×${s}`).join("  ")
              : "";
            return (
              <p key={i} style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.5)" }}>
                {c.qty}× {c.name.replace("Premium Workwear ", "")}{sizes ? ` · ${sizes}` : ""}
              </p>
            );
          })}
        </div>
      )}

      {/* Size breakdown (non-bundle) */}
      {!item.isBundle && item.sizeQtys && Object.keys(item.sizeQtys).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(item.sizeQtys).filter(([,q])=>q>0).map(([s,q]) => (
            <span key={s} style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.8)", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", padding:"2px 7px" }}>
              {s}: {q}
            </span>
          ))}
        </div>
      )}

      {/* Branding + positions */}
      <p
        style={{
          fontFamily: "var(--font-jetbrains,monospace)",
          fontSize: "0.46rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        {brandingLabel}
        {item.positions && item.positions.length > 0
          ? ` · ${item.positions.join(", ")}`
          : ""}
      </p>

      {/* Logo file + digitising */}
      {item.logo === "yes" && (
        <div className="flex items-center justify-between">
          <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(0,65,249,0.75)" }}>
            {item.logoFileName ? `Logo: ${item.logoFileName}` : "Logo: pending"}
          </p>
          {item.digitisingLabel && (
            <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.08em", textTransform:"uppercase", color: (item.digitisingFee ?? 0) > 0 ? "rgba(255,255,255,0.5)" : "#4ade80" }}>
              Digitising: {(item.digitisingFee ?? 0) > 0 ? `£${item.digitisingFee!.toFixed(2)}` : "FREE"}
            </p>
          )}
        </div>
      )}
      {item.logo === "no" && (
        <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.44rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.22)" }}>No logo</p>
      )}

      {/* Pricing row */}
      <div className="flex items-center justify-between mt-1">
        <p
          style={{
            fontFamily: "var(--font-jetbrains,monospace)",
            fontSize: "0.44rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)",
          }}
        >
          {item.totalQty} unit{item.totalQty !== 1 ? "s" : ""}
        </p>
        <p
          style={{
            fontFamily: "var(--font-bebas,'Bebas Neue')",
            fontSize: "1.15rem",
            letterSpacing: "0.04em",
            color: "#F5F5F3",
            lineHeight: 1,
          }}
        >
          On Quote
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   BASKET DRAWER
───────────────────────────────────────────────────────────────── */
export default function BasketDrawer() {
  const { items, totalQty, totalValue, totalDigitising, removeItem, isOpen, closeBasket } = useBasket();
  const router = useRouter();

  /* Lock body scroll while drawer is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const qualifiesForCheckout = basketQualifiesForCheckout(items);
  const statusMsg = checkoutStatusMessage(items, totalQty);

  const handleCTA = () => {
    closeBasket();
    router.push("/basket");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeBasket}
            className="fixed inset-0 z-[600]"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
          />

          {/* ── Panel ── */}
          <motion.div
            key="panel"
            initial={{ x: 440, opacity: 0 }}
            animate={{ x: 0,   opacity: 1 }}
            exit={{    x: 440, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[700] flex flex-col"
            style={{
              width: "min(440px, 100vw)",
              background: "#07070A",
              borderLeft: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "-16px 0 48px rgba(0,0,0,0.5)",
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-6 py-5 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <p
                  style={{
                    fontFamily: "var(--font-bebas,'Bebas Neue')",
                    fontSize: "1.4rem",
                    letterSpacing: "0.1em",
                    color: "#F5F5F3",
                    lineHeight: 1,
                  }}
                >
                  Your Basket
                </p>
                {totalQty > 0 && (
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "#0041F9",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains,monospace)",
                        fontSize: "0.5rem",
                        color: "#fff",
                        letterSpacing: 0,
                        lineHeight: 1,
                      }}
                    >
                      {totalQty}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={closeBasket}
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: "1.3rem",
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}
                aria-label="Close basket"
              >
                ×
              </button>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full gap-5 py-16 text-center">
                  <div
                    style={{
                      width: 56, height: 56,
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
                        stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-bebas,'Bebas Neue')",
                        fontSize: "1.3rem",
                        letterSpacing: "0.06em",
                        color: "#F5F5F3",
                        marginBottom: 8,
                      }}
                    >
                      Your basket is empty
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-jetbrains,monospace)",
                        fontSize: "0.5rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      Add products from the catalogue
                    </p>
                  </div>
                  <Link
                    href="/products"
                    onClick={closeBasket}
                    style={{
                      fontFamily: "var(--font-jetbrains,monospace)",
                      fontSize: "0.52rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "#0041F9",
                      textDecoration: "none",
                    }}
                  >
                    Browse Products →
                  </Link>
                </div>
              ) : (
                /* Item list */
                <div>
                  {items.map(item => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Footer (only when items exist) ── */}
            {items.length > 0 && (
              <div
                className="flex-shrink-0 px-6 pb-6 pt-4 flex flex-col gap-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                {/* Summary */}
                {totalDigitising > 0 && (
                  <div className="flex flex-col gap-0.5 mb-2 pb-2" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center justify-between">
                      <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.46rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>
                        One-Time Logo Digitising
                      </p>
                      <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.52rem", color:"rgba(255,255,255,0.7)" }}>
                        £{totalDigitising.toFixed(2)}
                      </p>
                    </div>
                    <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.7rem", color:"rgba(255,255,255,0.28)", lineHeight:1.4 }}>
                      Future orders using the same logo are free.
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.5rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)" }}>
                    {totalQty} unit{totalQty !== 1 ? "s" : ""} · Total price
                  </p>
                  <p style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.6rem", letterSpacing:"0.04em", color:"#F5F5F3", lineHeight:1 }}>
                    On Quote
                  </p>
                </div>

                {/* Smart CTA */}
                <button
                  onClick={handleCTA}
                  className="w-full flex items-center justify-center gap-3 py-4 cursor-pointer"
                  style={{
                    background: qualifiesForCheckout ? "#0041F9" : "transparent",
                    border: `1px solid ${qualifiesForCheckout ? "#0041F9" : "rgba(255,255,255,0.2)"}`,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    if (qualifiesForCheckout) el.style.background = "#0035CC";
                    else el.style.borderColor = "rgba(255,255,255,0.5)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    if (qualifiesForCheckout) el.style.background = "#0041F9";
                    else el.style.borderColor = "rgba(255,255,255,0.2)";
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains,monospace)",
                      fontSize: "0.58rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: qualifiesForCheckout ? "#fff" : "rgba(255,255,255,0.75)",
                    }}
                  >
                    {qualifiesForCheckout
                      ? "Proceed to Checkout →"
                      : "Request Quote →"}
                  </span>
                </button>

                {/* Context note */}
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains,monospace)",
                    fontSize: "0.44rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.22)",
                    textAlign: "center",
                  }}
                >
                  {statusMsg}
                </p>

                {/* Continue shopping */}
                <button
                  onClick={closeBasket}
                  style={{
                    fontFamily: "var(--font-jetbrains,monospace)",
                    fontSize: "0.48rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.28)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.28)"; }}
                >
                  ← Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
