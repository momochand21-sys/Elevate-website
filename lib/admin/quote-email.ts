import type { Quote, BrandingMethod } from "./types";

/**
 * Builds the customer-facing quote email — a dark, branded HTML table that
 * mirrors the quote exactly as it appears in the CRM (same two-panel layout +
 * line-item table + totals), so what the customer receives matches what the
 * admin sees on screen.
 *
 * IMPORTANT: customer-facing, so it shows ONLY the figures the customer should
 * see (subtotal, discount, total). Internal numbers — cost, gross profit,
 * margin — are never included.
 */

const C = {
  bg: "#050505",
  panel: "#0f0f0f",
  head: "#0a0a0a",
  border: "#1a1a1a",
  rule: "#141414",
  text: "#F5F5F3",
  muted: "#8a8a8a",
  faint: "#666666",
  accent: "#0041F9",
  danger: "#ef4444",
};

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function methodLabel(m: BrandingMethod): string {
  return m === "embroidery" ? "Embroidery" : m === "print" ? "Print" : m === "both" ? "Embroidery + Print" : "—";
}

function money(n: number): string {
  return `£${Number(n || 0).toFixed(2)}`;
}

export function buildCustomerQuoteEmail(quote: Quote): {
  subject: string;
  html: string;
  text: string;
} {
  const name = quote.contact || quote.company || "there";
  const dateStr = new Date(quote.createdAt).toLocaleDateString("en-GB", { dateStyle: "long" });
  const hasDiscount = quote.discountPercent > 0;

  /* ── "Prepared for" rows (only show fields that have a value) ── */
  const customerRows = [
    ["Company", quote.company],
    ["Contact", quote.contact],
    ["Email", quote.email],
    ["Phone", quote.phone],
    ["Postcode", quote.postcode],
  ]
    .filter(([, v]) => v)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:4px 0;font-size:12px;color:${C.muted};">${esc(label)}</td>
          <td style="padding:4px 0;font-size:13px;color:${C.text};text-align:right;">${esc(value)}</td>
        </tr>`
    )
    .join("");

  /* ── Summary (customer-facing figures only) ── */
  const summaryRows = `
    <tr>
      <td style="padding:5px 0;font-size:13px;color:${C.muted};">Subtotal</td>
      <td style="padding:5px 0;font-size:13px;color:${hasDiscount ? C.muted : C.text};text-align:right;${hasDiscount ? "text-decoration:line-through;" : ""}">${money(quote.subtotal)}</td>
    </tr>
    ${
      hasDiscount
        ? `<tr>
            <td style="padding:5px 0;font-size:13px;color:${C.danger};">Discount (${esc(quote.discountPercent)}%)</td>
            <td style="padding:5px 0;font-size:13px;color:${C.danger};text-align:right;">−${money(quote.discountAmount)}</td>
          </tr>`
        : ""
    }
    <tr><td colspan="2" style="padding:6px 0 0;border-top:1px solid ${C.border};"></td></tr>
    <tr>
      <td style="padding:8px 0 0;font-size:14px;color:${C.text};font-weight:700;">Total</td>
      <td style="padding:8px 0 0;font-size:20px;color:${C.accent};font-weight:700;text-align:right;">${money(quote.totalRevenue)}</td>
    </tr>`;

  /* ── Order items table rows ── */
  const itemRows = quote.items
    .map((it, i) => {
      const last = i === quote.items.length - 1;
      const border = last ? "" : `border-bottom:1px solid ${C.rule};`;
      return `
        <tr>
          <td style="padding:12px 14px;${border}font-size:13px;color:${C.text};">
            ${esc(it.productName)}
            ${it.productCode ? `<br/><span style="font-size:11px;color:${C.faint};font-family:'Courier New',monospace;">${esc(it.productCode)}</span>` : ""}
          </td>
          <td style="padding:12px 14px;${border}font-size:13px;color:${C.muted};text-align:center;">${esc(it.qty)}</td>
          <td style="padding:12px 14px;${border}font-size:13px;color:${C.muted};">${methodLabel(it.method)}</td>
          <td style="padding:12px 14px;${border}font-size:12px;color:${C.muted};">${it.positions.length ? esc(it.positions.join(", ")) : "—"}</td>
          <td style="padding:12px 14px;${border}font-size:13px;color:${C.text};text-align:right;white-space:nowrap;">${money(it.totalPerUnit)}</td>
          <td style="padding:12px 14px;${border}font-size:13px;color:${C.accent};font-weight:700;text-align:right;white-space:nowrap;">${money(it.lineTotal)}</td>
        </tr>`;
    })
    .join("");

  const th = (label: string, align = "left") =>
    `<th style="padding:10px 14px;text-align:${align};font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:${C.muted};font-weight:600;border-bottom:1px solid ${C.border};">${label}</th>`;

  const notesBlock = quote.orderNotes
    ? `<tr><td style="padding:0 28px 22px;">
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.panel};border:1px solid ${C.border};border-left:2px solid ${C.accent};">
           <tr><td style="padding:14px 16px;">
             <p style="margin:0 0 5px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};">Notes</p>
             <p style="margin:0;font-size:13px;color:${C.text};line-height:1.6;">${esc(quote.orderNotes)}</p>
           </td></tr>
         </table>
       </td></tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="dark"/>
<meta name="supported-color-schemes" content="dark"/>
<title>Your Quote — ${esc(quote.reference)}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.bg}" style="background:${C.bg};padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="680" cellpadding="0" cellspacing="0" bgcolor="${C.bg}" style="max-width:680px;width:100%;background:${C.bg};">

  <!-- Accent bar -->
  <tr><td style="height:3px;background:${C.accent};line-height:3px;font-size:0;">&nbsp;</td></tr>

  <!-- Header -->
  <tr><td style="padding:26px 28px 22px;border-bottom:1px solid ${C.border};">
    <p style="margin:0 0 14px;font-size:11px;letter-spacing:3px;color:${C.muted};text-transform:uppercase;">
      <span style="color:${C.text};font-weight:700;">ELEVATE</span>&nbsp;&nbsp;Workwear Solutions
    </p>
    <p style="margin:0;font-size:26px;font-weight:700;letter-spacing:2px;color:${C.text};">${esc(quote.reference)}</p>
    <p style="margin:8px 0 0;font-size:12px;color:${C.muted};">${esc(quote.company)} &middot; ${esc(dateStr)}</p>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:24px 28px 6px;">
    <p style="margin:0 0 10px;font-size:15px;color:${C.text};">Hi ${esc(name)},</p>
    <p style="margin:0;font-size:13px;color:${C.muted};line-height:1.6;">
      Thank you for your interest in Elevate Workwear Solutions. Please find your quote below.
    </p>
  </td></tr>

  <!-- Two panels: Prepared for + Summary -->
  <tr><td style="padding:18px 28px 6px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" valign="top" style="padding-right:8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.panel};border:1px solid ${C.border};">
            <tr><td style="padding:16px 18px;">
              <p style="margin:0 0 12px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};">Prepared For</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${customerRows}</table>
            </td></tr>
          </table>
        </td>
        <td width="50%" valign="top" style="padding-left:8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.panel};border:1px solid ${C.border};">
            <tr><td style="padding:16px 18px;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};">Summary</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${summaryRows}</table>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Order items -->
  <tr><td style="padding:18px 28px 6px;">
    <p style="margin:0 0 12px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};">Order Items</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.head};border:1px solid ${C.border};border-collapse:collapse;">
      <thead>
        <tr bgcolor="${C.head}">
          ${th("Product")}${th("Qty", "center")}${th("Method")}${th("Positions")}${th("Per Unit", "right")}${th("Total", "right")}
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
  </td></tr>

  ${notesBlock}

  <!-- Sign-off -->
  <tr><td style="padding:14px 28px 26px;">
    <p style="margin:0 0 14px;font-size:13px;color:${C.muted};line-height:1.6;">
      Just reply to this email if you have any questions, or let us know if you're ready to go ahead —
      we'll get everything moving right away.
    </p>
    <p style="margin:0;font-size:13px;color:${C.text};">Best regards,<br/>
      <strong>Elevate Workwear Solutions</strong><br/>
      <a href="mailto:info@elevateworkwear.com" style="color:${C.accent};text-decoration:none;">info@elevateworkwear.com</a>
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 28px;border-top:1px solid ${C.border};background:${C.head};">
    <p style="margin:0;font-size:10px;color:${C.faint};letter-spacing:1px;text-transform:uppercase;">
      Elevate Workwear Solutions &middot; ${esc(dateStr)}
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  /* ── plain-text fallback ── */
  const text = [
    `Hi ${name},`,
    ``,
    `Thank you for your interest in Elevate Workwear Solutions. Here is your quote (Ref: ${quote.reference}), dated ${dateStr}:`,
    ``,
    ...quote.items.map(
      (it) =>
        `- ${it.qty}x ${it.productName}` +
        `${it.positions.length ? ` (${methodLabel(it.method)}, ${it.positions.join("/")})` : ""}` +
        ` — ${money(it.totalPerUnit)}/unit — ${money(it.lineTotal)}`
    ),
    ``,
    ...(hasDiscount
      ? [`Subtotal: ${money(quote.subtotal)}`, `Discount (${quote.discountPercent}%): -${money(quote.discountAmount)}`]
      : []),
    `Total: ${money(quote.totalRevenue)}`,
    ...(quote.orderNotes ? [``, `Notes: ${quote.orderNotes}`] : []),
    ``,
    `Just reply to this email with any questions, or let us know if you're ready to go ahead.`,
    ``,
    `Best regards,`,
    `Elevate Workwear Solutions`,
    `info@elevateworkwear.com`,
  ].join("\n");

  return {
    subject: `Your Quote from Elevate Workwear — ${quote.reference}`,
    html,
    text,
  };
}
