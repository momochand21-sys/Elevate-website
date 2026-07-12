"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useBasket } from "@/lib/basket-context";

type VerifyState = "loading" | "valid" | "invalid" | "error";

function CheckoutSuccessInner() {
  const params    = useSearchParams();
  const sessionId = params.get("session_id");
  const { clearBasket } = useBasket();

  const [state,       setState      ] = useState<VerifyState>("loading");
  const [amountTotal, setAmountTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) { setState("invalid"); return; }

    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setState("valid");
          setAmountTotal(data.amountTotal ?? null);
          clearBasket();
        } else {
          setState("invalid");
        }
      })
      .catch(() => setState("error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (state === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#050505" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-blue/30 border-t-blue animate-spin" />
          <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)" }}>
            Confirming payment…
          </p>
        </div>
      </main>
    );
  }

  if (state === "invalid" || state === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#050505" }}>
        <div className="flex flex-col items-center text-center gap-6 max-w-md"
          style={{ padding:"48px 40px", border:"1px solid rgba(255,100,100,0.3)", background:"rgba(255,100,100,0.04)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background:"rgba(255,100,100,0.15)", border:"1px solid rgba(255,100,100,0.3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v5M12 16h.01" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="9" stroke="#f87171" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"2rem", letterSpacing:"0.05em", color:"#F5F5F3", lineHeight:1, marginBottom:8 }}>
              Payment Not Confirmed
            </h1>
            <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.9rem", color:"rgba(255,255,255,0.45)", lineHeight:1.75 }}>
              We could not verify your payment. If you were charged, please contact us immediately.
            </p>
          </div>
          <a href="mailto:info@elevateworkwear.com"
            style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#0041F9" }}>
            info@elevateworkwear.com
          </a>
          <Link href="/basket">
            <span style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)", cursor:"pointer" }}>
              ← Return to Basket
            </span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#050505" }}>
      <div className="flex flex-col items-center text-center gap-6 max-w-md"
        style={{ padding:"48px 40px", border:"1px solid rgba(0,65,249,0.3)", background:"rgba(0,65,249,0.05)" }}>
        <div className="w-16 h-16 rounded-full bg-blue flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M5 13L10 18L21 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color:"rgba(0,65,249,0.75)" }}>
            Payment Confirmed
          </p>
          <h1 style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"clamp(1.8rem,4vw,2.6rem)", letterSpacing:"0.05em", color:"#F5F5F3", lineHeight:1, marginBottom:12 }}>
            Order Placed Successfully
          </h1>
          {amountTotal !== null && (
            <p style={{ fontFamily:"var(--font-bebas,'Bebas Neue')", fontSize:"1.6rem", letterSpacing:"0.04em", color:"rgba(255,255,255,0.55)", lineHeight:1, marginBottom:12 }}>
              £{(amountTotal / 100).toFixed(2)} charged
            </p>
          )}
          <p style={{ fontFamily:"var(--font-dm-sans,sans-serif)", fontSize:"0.9rem", color:"rgba(255,255,255,0.45)", lineHeight:1.75 }}>
            Thank you for your order. A confirmation has been sent to your email
            and the Elevate Workwear team will begin processing your garments shortly.
          </p>
        </div>
        <div style={{ width:"100%", padding:"14px 20px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontFamily:"var(--font-jetbrains,monospace)", fontSize:"0.55rem", letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)", lineHeight:1.7 }}>
            Production begins within 1–2 business days.
            For queries contact{" "}
            <a href="mailto:info@elevateworkwear.com" style={{ color:"rgba(0,65,249,0.8)" }}>
              info@elevateworkwear.com
            </a>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/products" className="flex-1">
            <span className="inline-flex items-center justify-center w-full gap-2 py-3 font-mono text-[10px] tracking-[0.16em] uppercase text-off-white border border-blue/50 hover:bg-blue/10 transition-all duration-300 cursor-pointer">
              Browse More Products
            </span>
          </Link>
          <Link href="/" className="flex-1">
            <span className="inline-flex items-center justify-center w-full gap-2 py-3 font-mono text-[10px] tracking-[0.16em] uppercase text-muted hover:text-off-white border border-white/10 hover:border-white/25 transition-all duration-300 cursor-pointer">
              Return Home
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}

import { Suspense } from "react";
export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#050505" }}>
        <div className="w-10 h-10 rounded-full border-2 border-blue/30 border-t-blue animate-spin" />
      </main>
    }>
      <CheckoutSuccessInner />
    </Suspense>
  );
}
