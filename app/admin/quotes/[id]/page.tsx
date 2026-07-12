"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, ArrowRight, Check, Send, Mail, MessageCircle, MessageSquare, Pencil } from "lucide-react";
import type { Quote, QuoteStatus } from "@/lib/admin/types";

const S = { text: "#F5F5F3", muted: "#777", accent: "#0041F9", success: "#22c55e", danger: "#ef4444", warning: "#f59e0b", border: "#1a1a1a" };

const STATUS_COLORS: Record<QuoteStatus, string> = {
  new: "#0041F9", sent: "#f59e0b", approved: "#22c55e", rejected: "#ef4444", converted: "#8b5cf6",
};
const STATUS_LABELS: Record<QuoteStatus, string> = {
  new: "New", sent: "Sent", approved: "Approved", rejected: "Rejected", converted: "Converted",
};
const STATUS_NEXT: Partial<Record<QuoteStatus, QuoteStatus>> = {
  new: "sent", sent: "approved",
};

/** Convert a UK-style phone number into international digits-only format for wa.me / sms: links */
function intlPhone(phone: string): string {
  const cleaned = phone.replace(/\(0\)/g, "");           // "+44 (0)7700…" → "+44 7700…"
  const digits = cleaned.replace(/[^\d+]/g, "");
  const stripped = digits.startsWith("+") ? digits.slice(1) : digits;
  return stripped.startsWith("0") ? `44${stripped.slice(1)}` : stripped;
}

/** Plain-text quote summary, tailored per channel — email is fuller, SMS stays short */
function quoteMessage(q: Quote, channel: "email" | "whatsapp" | "sms"): string {
  const name = q.contact || q.company || "there";
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const itemLines = q.items.map(
    (it) => `• ${it.qty}x ${it.productName}${it.positions.length ? ` (${cap(it.method)}, ${it.positions.join("/")})` : ""} — £${it.lineTotal.toFixed(2)}`
  );
  const totalLine = q.discountPercent > 0
    ? `Total: £${q.totalRevenue.toFixed(2)} (includes ${q.discountPercent}% discount — was £${q.subtotal.toFixed(2)})`
    : `Total: £${q.totalRevenue.toFixed(2)}`;

  if (channel === "sms") {
    return `Hi ${name}, your Elevate Workwear quote (${q.reference}) comes to £${q.totalRevenue.toFixed(2)}. Full breakdown sent to your email — just reply here with any questions! — Elevate Workwear`;
  }

  if (channel === "whatsapp") {
    return [
      `Hi ${name} 👋 — here's your quote from Elevate Workwear (Ref: ${q.reference}):`,
      ``,
      ...itemLines,
      ``,
      totalLine,
      ``,
      `Let us know if you'd like to go ahead! 🙌`,
    ].join("\n");
  }

  return [
    `Hi ${name},`,
    ``,
    `Thanks for your interest in Elevate Workwear Solutions — please find your quote (Ref: ${q.reference}) summarised below:`,
    ``,
    ...itemLines,
    ``,
    ...(q.discountPercent > 0 ? [
      `Subtotal: £${q.subtotal.toFixed(2)}`,
      `Discount (${q.discountPercent}%): -£${q.discountAmount.toFixed(2)}`,
    ] : []),
    `Total: £${q.totalRevenue.toFixed(2)}`,
    ``,
    `Just reply to this email if you have any questions, or let us know if you're ready to go ahead — we'll get everything moving right away.`,
    ``,
    `Best regards,`,
    `Elevate Workwear Solutions`,
    `info@elevateworkwear.com`,
  ].join("\n");
}

function sendBtnStyle(enabled: boolean): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 16px", fontSize: "0.7rem",
    background: enabled ? "#0a0a0a" : "transparent",
    border: `1px solid ${enabled ? "#2a2a2a" : "#181818"}`,
    color: enabled ? S.text : "#3a3a3a",
    textDecoration: "none",
    cursor: enabled ? "pointer" : "not-allowed",
    pointerEvents: enabled ? "auto" : "none",
  };
}

export default function QuoteDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertCosts, setConvertCosts] = useState({ digitisingCost: 0, packagingCost: 0, paymentFee: 0, shippingCost: 0 });
  const [showConvert, setShowConvert] = useState(false);
  const [msg, setMsg] = useState("");
  const [discountInput, setDiscountInput] = useState(0);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/quotes/${id}`).then((r) => r.json()).then((q: Quote) => {
      setQuote(q);
      setDiscountInput(q.discountPercent ?? 0);
    });
  }, [id]);

  async function applyDiscount() {
    setSavingDiscount(true);
    const res = await fetch(`/api/admin/quotes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discountPercent: discountInput }),
    });
    setSavingDiscount(false);
    if (res.ok) {
      const data = await res.json();
      setQuote(data);
      setDiscountInput(data.discountPercent);
      setMsg(data.discountPercent > 0 ? `Discount set to ${data.discountPercent}%` : "Discount removed");
      setTimeout(() => setMsg(""), 3000);
    }
  }

  async function updateStatus(status: QuoteStatus) {
    const res = await fetch(`/api/admin/quotes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setQuote(data);
      setMsg(`Status updated to ${STATUS_LABELS[status]}`);
      setTimeout(() => setMsg(""), 3000);
    }
  }

  async function convertToOrder() {
    setConverting(true);
    const res = await fetch(`/api/admin/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "convert", ...convertCosts }),
    });
    setConverting(false);
    if (res.ok) {
      const { order } = await res.json();
      router.push(`/admin/orders/${order.id}`);
    }
  }

  function downloadPdf() {
    window.open(`/api/admin/quotes/${id}/pdf`, "_blank");
  }

  if (!quote) return <div style={{ padding: 48, color: S.muted, fontSize: "0.8rem" }}>Loading…</div>;

  const whatsappHref = quote.phone
    ? `https://wa.me/${intlPhone(quote.phone)}?text=${encodeURIComponent(quoteMessage(quote, "whatsapp"))}`
    : "";
  const smsHref = quote.phone
    ? `sms:${quote.phone.replace(/\s+/g, "")}?body=${encodeURIComponent(quoteMessage(quote, "sms"))}`
    : "";

  // Sending the quote effectively *is* the "sent" action — auto-advance new → sent
  function markSentIfNew() {
    if (quote && quote.status === "new") updateStatus("sent");
  }

  // Email the customer a formatted HTML-table quote via the server (Resend).
  async function sendEmail() {
    if (!quote?.email || sending) return;
    if (!window.confirm(`Email this quote to ${quote.email}?`)) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/quotes/${id}/send`, { method: "POST" });
      if (res.ok) {
        const fresh: Quote = await fetch(`/api/admin/quotes/${id}`).then((r) => r.json());
        setQuote(fresh);
        setMsg(`Quote emailed to ${quote.email}`);
      } else {
        const data = await res.json().catch(() => ({}));
        setMsg(`Failed: ${data.error ?? "could not send email"}`);
      }
    } catch {
      setMsg("Failed: network error");
    } finally {
      setSending(false);
      setTimeout(() => setMsg(""), 4000);
    }
  }

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36, flexWrap: "wrap" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: S.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "1.8rem", letterSpacing: "0.06em", color: S.text, lineHeight: 1 }}>{quote.reference}</h1>
          <p style={{ fontSize: "0.7rem", color: S.muted, marginTop: 4 }}>{quote.company} · {new Date(quote.createdAt).toLocaleDateString("en-GB", { dateStyle: "long" })}</p>
        </div>
        <span style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: STATUS_COLORS[quote.status], background: `${STATUS_COLORS[quote.status]}18`, padding: "4px 10px" }}>
          {STATUS_LABELS[quote.status]}
        </span>
        {msg && <p style={{ fontSize: "0.72rem", color: msg.startsWith("Failed") ? S.danger : S.success, marginLeft: "auto" }}>{msg}</p>}
      </div>

      {/* Send to customer */}
      <div style={{ background: "rgba(0,65,249,0.05)", border: "1px solid rgba(0,65,249,0.22)", padding: "16px 20px", marginBottom: 28, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Send size={14} color={S.accent} />
          <span style={{ fontSize: "0.72rem", color: S.text, fontWeight: 600 }}>
            Send this quote to {quote.contact || quote.company}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginLeft: "auto" }}>
          <button
            onClick={sendEmail}
            disabled={!quote.email || sending}
            title={quote.email ? `Email ${quote.email}` : "Add a customer email to enable this"}
            style={{ ...sendBtnStyle(!!quote.email && !sending), fontFamily: "inherit" }}
          >
            <Mail size={13} /> {sending ? "Sending…" : "Email"}
          </button>
          <a
            href={whatsappHref || undefined}
            onClick={markSentIfNew}
            target="_blank" rel="noopener noreferrer"
            title={whatsappHref ? `WhatsApp ${quote.phone}` : "Add a customer phone number to enable this"}
            style={sendBtnStyle(!!whatsappHref)}
          >
            <MessageCircle size={13} /> WhatsApp
          </a>
          <a
            href={smsHref || undefined}
            onClick={markSentIfNew}
            title={smsHref ? `Text ${quote.phone}` : "Add a customer phone number to enable this"}
            style={sendBtnStyle(!!smsHref)}
          >
            <MessageSquare size={13} /> Text / SMS
          </a>
        </div>
        {!quote.email && !quote.phone && (
          <p style={{ fontSize: "0.66rem", color: S.muted, width: "100%", marginTop: -4 }}>
            Add an email or phone number to this quote to enable sending.
          </p>
        )}
        {(quote.email || whatsappHref) && (
          <p style={{ fontSize: "0.62rem", color: S.muted, width: "100%", marginTop: -6, lineHeight: 1.5 }}>
            <strong style={{ color: S.text }}>Email</strong> sends the customer a formatted quote with the full items table.{" "}
            <strong style={{ color: S.text }}>WhatsApp</strong> &amp; <strong style={{ color: S.text }}>SMS</strong> open your own app with a short text summary.
          </p>
        )}
      </div>

      {/* Customer + financials */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "18px 20px" }}>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, marginBottom: 12 }}>Customer</p>
          {[
            { l: "Company", v: quote.company },
            { l: "Contact", v: quote.contact },
            { l: "Email", v: quote.email },
            { l: "Phone", v: quote.phone },
            { l: "Postcode", v: quote.postcode ?? "—" },
          ].map(({ l, v }) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.7rem", color: S.muted }}>{l}</span>
              <span style={{ fontSize: "0.75rem", color: S.text }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "18px 20px" }}>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, marginBottom: 12 }}>Financials</p>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: "0.7rem", color: S.muted }}>Subtotal</span>
            <span style={{ fontSize: "0.8rem", color: quote.discountPercent > 0 ? S.muted : S.text, textDecoration: quote.discountPercent > 0 ? "line-through" : "none" }}>
              £{quote.subtotal.toFixed(2)}
            </span>
          </div>

          {/* Discount — editable */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingBottom: 12, borderBottom: "1px solid #1a1a1a" }}>
            <span style={{ fontSize: "0.7rem", color: S.muted }}>Discount</span>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {quote.discountAmount > 0 && <span style={{ fontSize: "0.72rem", color: S.danger }}>−£{quote.discountAmount.toFixed(2)}</span>}
              <input
                type="number" min={0} max={100} step="0.5"
                value={discountInput || ""}
                onChange={(e) => setDiscountInput(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                placeholder="0"
                style={{ width: 50, padding: "4px 6px", background: "#0a0a0a", border: "1px solid #1f1f1f", color: S.text, fontSize: "0.7rem", outline: "none", fontFamily: "inherit", textAlign: "right", boxSizing: "border-box" }}
                onFocus={(e) => { e.target.style.borderColor = S.accent; }}
                onBlur={(e) => { e.target.style.borderColor = "#1f1f1f"; }}
              />
              <span style={{ fontSize: "0.68rem", color: S.muted }}>%</span>
              <button
                onClick={applyDiscount}
                disabled={savingDiscount || discountInput === quote.discountPercent}
                style={{
                  fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 10px", cursor: savingDiscount || discountInput === quote.discountPercent ? "default" : "pointer",
                  background: "transparent",
                  border: `1px solid ${discountInput === quote.discountPercent ? "#222" : S.accent}`,
                  color: discountInput === quote.discountPercent ? "#444" : S.accent,
                }}
              >
                {savingDiscount ? "…" : "Apply"}
              </button>
            </div>
          </div>

          {[
            { l: "Total Revenue", v: `£${quote.totalRevenue.toFixed(2)}`, color: S.text, big: true },
            { l: "Est. Total Cost", v: `£${quote.totalCost.toFixed(2)}`, color: S.muted },
            { l: "Est. Gross Profit", v: `£${quote.grossProfit.toFixed(2)}`, color: quote.grossProfit >= 0 ? S.success : S.danger },
            { l: "Est. Margin", v: `${quote.margin}%`, color: quote.margin >= 30 ? S.success : S.warning },
          ].map(({ l, v, color, big }) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: "0.7rem", color: S.muted }}>{l}</span>
              <span style={{ fontSize: big ? "0.92rem" : "0.85rem", fontWeight: 600, color }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div style={{ marginBottom: 32 }}>
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
              {quote.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: i < quote.items.length - 1 ? "1px solid #141414" : "none" }}>
                  <td style={{ padding: "10px 14px", color: S.text }}>
                    <div>{item.productName}</div>
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

      {quote.orderNotes && (
        <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "14px 18px", marginBottom: 32 }}>
          <p style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: S.muted, marginBottom: 6 }}>Notes</p>
          <p style={{ fontSize: "0.8rem", color: S.muted }}>{quote.orderNotes}</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a
          href={`/admin/quotes/${id}/edit`}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "transparent", border: `1px solid ${S.accent}`, color: S.accent, fontSize: "0.7rem", textDecoration: "none" }}
        >
          <Pencil size={13} /> Edit Quote
        </a>

        <button
          onClick={downloadPdf}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "transparent", border: "1px solid #2a2a2a", color: S.muted, fontSize: "0.7rem", cursor: "pointer" }}
        >
          <Printer size={13} /> Download PDF
        </button>

        {STATUS_NEXT[quote.status] && (
          <button
            onClick={() => updateStatus(STATUS_NEXT[quote.status]!)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "transparent", border: "1px solid #2a2a2a", color: S.muted, fontSize: "0.7rem", cursor: "pointer" }}
          >
            <Check size={13} /> Mark as {STATUS_LABELS[STATUS_NEXT[quote.status]!]}
          </button>
        )}

        {quote.status === "new" && (
          <button
            onClick={() => updateStatus("rejected")}
            style={{ padding: "10px 18px", background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: S.danger, fontSize: "0.7rem", cursor: "pointer" }}
          >
            Reject
          </button>
        )}

        {quote.status === "approved" && !quote.orderId && (
          <button
            onClick={() => setShowConvert(!showConvert)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: S.accent, border: "none", color: "#fff", fontSize: "0.7rem", cursor: "pointer" }}
          >
            <ArrowRight size={13} /> Convert to Order
          </button>
        )}

        {quote.orderId && (
          <a href={`/admin/orders/${quote.orderId}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "#8b5cf6", color: "#fff", fontSize: "0.7rem", textDecoration: "none" }}>
            View Order
          </a>
        )}
      </div>

      {/* Convert panel */}
      {showConvert && (
        <div style={{ marginTop: 24, background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "20px" }}>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: S.muted, marginBottom: 16 }}>Convert to Order — Set Additional Costs</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Digitising Cost", field: "digitisingCost" },
              { label: "Packaging", field: "packagingCost" },
              { label: "Payment Fee (Stripe)", field: "paymentFee" },
              { label: "Shipping", field: "shippingCost" },
            ].map(({ label, field }) => (
              <div key={field}>
                <label style={{ display: "block", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.muted, marginBottom: 5 }}>{label}</label>
                <input
                  type="number"
                  step="0.01"
                  value={(convertCosts as Record<string, number>)[field]}
                  onChange={(e) => setConvertCosts({ ...convertCosts, [field]: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  style={{ width: "100%", padding: "8px 10px", background: "#0a0a0a", border: "1px solid #1f1f1f", color: S.text, fontSize: "0.8rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.7rem", color: S.muted, marginBottom: 12 }}>
            Leave Payment Fee as 0 to auto-calculate Stripe UK fee (1.4% + £0.20)
          </p>
          <button
            onClick={convertToOrder}
            disabled={converting}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: S.success, border: "none", color: "#fff", fontSize: "0.7rem", cursor: "pointer" }}
          >
            <ArrowRight size={13} /> {converting ? "Converting…" : "Create Order"}
          </button>
        </div>
      )}
    </div>
  );
}
