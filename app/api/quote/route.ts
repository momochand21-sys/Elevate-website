import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { insertOne, generateId, generateRef } from "@/lib/admin/db";
import { calcQuoteProfits } from "@/lib/admin/calculations";
import type { Quote, OrderItem } from "@/lib/admin/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      /* Customer */
      company, contact, email, phone, title, website, postcode, addNotes,
      /* Product config (single product) */
      productName, size, qty, method, positions, fileName, notes,
      /* Pricing */
      basePerUnit, brandingCost, totalPerUnit, totalOrder,
      /* Reference */
      reference,
      /* Basket (multi-item) */
      basket, orderNotes,
    } = body;

    /* ── If basket array was sent, generate a basket-style email ── */
    if (Array.isArray(basket) && basket.length > 0) {
      const ts = new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });
      const ref = reference ?? `BSK-${Date.now().toString(36).toUpperCase()}`;
      const grandTotal = basket.reduce((s: number, i: { totalOrder: number }) => s + i.totalOrder, 0);
      const totalUnits = basket.reduce((s: number, i: { totalQty: number }) => s + i.totalQty, 0);

      const itemRows = basket.map((item: {
        productCode?: string; productName: string; totalQty: number;
        sizeQtys?: Record<string, number>; qty?: number;
        logo: string; method?: string; positions?: string[];
        basePerUnit: number; brandingCost: number; totalPerUnit: number; totalOrder: number;
        logoFileName?: string; notes?: string;
        isBundle?: boolean;
        bundleContents?: { name: string; qty: number; sizeQtys?: Record<string, number> }[];
      }) => {
        const sizes = item.isBundle && item.bundleContents
          ? item.bundleContents.map(c => {
              const sz = c.sizeQtys
                ? Object.entries(c.sizeQtys).filter(([, q]) => q > 0).map(([s, q]) => `${q}×${s}`).join("/")
                : "";
              return `${c.qty}× ${c.name.replace("Premium Workwear ", "")}${sz ? ` (${sz})` : ""}`;
            }).join("<br/>")
          : item.sizeQtys
          ? Object.entries(item.sizeQtys).filter(([, q]) => q > 0).map(([s, q]) => `${q}×${s}`).join(", ")
          : item.qty ? `${item.qty} units (One Size)` : "—";
        const methodLabel = item.method === "embroidery" ? "Embroidery"
          : item.method === "print" ? "Print"
          : item.method === "both" ? "Embroidery + Print" : "None";

        return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">
            <strong>${item.productName}</strong><br/>
            <span style="font-size:11px;color:#888">${item.productCode ?? ""}</span>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:12px">${sizes}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:12px">${item.totalQty}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:12px">${methodLabel}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:12px">${(item.positions ?? []).join(", ") || "—"}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;text-align:right">£${item.totalPerUnit.toFixed(2)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:700;text-align:right;color:#0041F9">£${item.totalOrder.toFixed(2)}</td>
        </tr>`;
      }).join("");

      const basketHtml = `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Basket Quote — ${ref}</title>
<style>body{margin:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif}</style>
</head><body>
<div style="max-width:700px;margin:32px auto;background:#fff">
  <div style="background:#07070A;padding:28px 32px;border-bottom:3px solid #0041F9">
    <p style="color:#fff;font-size:22px;font-weight:700;letter-spacing:2px;margin:0">ELEVATE</p>
    <p style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:6px 0 0">Workwear Solutions — Basket Quote Request</p>
  </div>
  <div style="background:#0041F9;padding:14px 32px;display:flex;justify-content:space-between;align-items:center">
    <span style="color:rgba(255,255,255,0.6);font-size:10px;letter-spacing:2px;text-transform:uppercase">Reference</span>
    <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:3px">${ref}</span>
  </div>
  <div style="padding:28px 32px">
    <h2 style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#0041F9;border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:16px">Customer Details</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px">
      <tr>
        <td style="padding:6px 12px 6px 0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888;width:110px">Name</td>
        <td style="padding:6px 0;color:#111">${contact}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px 6px 0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888">Email</td>
        <td style="padding:6px 0;color:#111"><a href="mailto:${email}" style="color:#0041F9;text-decoration:none">${email}</a></td>
      </tr>
      ${company && company !== "—" ? `<tr>
        <td style="padding:6px 12px 6px 0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888">Business</td>
        <td style="padding:6px 0;color:#111">${company}</td>
      </tr>` : ""}
      ${phone && phone !== "—" ? `<tr>
        <td style="padding:6px 12px 6px 0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888">Phone</td>
        <td style="padding:6px 0;color:#111">${phone}</td>
      </tr>` : ""}
    </table>
    <h2 style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#0041F9;border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:16px">Order Items</h2>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead>
        <tr style="background:#f9fafb">
          <th style="padding:8px 12px;text-align:left;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888">Product</th>
          <th style="padding:8px 12px;text-align:left;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888">Sizes</th>
          <th style="padding:8px 12px;text-align:left;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888">Units</th>
          <th style="padding:8px 12px;text-align:left;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888">Branding</th>
          <th style="padding:8px 12px;text-align:left;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888">Positions</th>
          <th style="padding:8px 12px;text-align:right;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888">Per Unit</th>
          <th style="padding:8px 12px;text-align:right;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888">Line Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px 20px;margin-top:16px">
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:8px">
        <span style="font-size:11px;color:#555;letter-spacing:1px;text-transform:uppercase">Total Units</span>
        <span style="font-size:13px;color:#111">${totalUnits} units</span>
      </div>
      <div style="display:flex;justify-content:space-between">
        <span style="font-size:11px;color:#555;letter-spacing:1px;text-transform:uppercase;font-weight:700">Estimated Grand Total</span>
        <span style="font-size:20px;font-weight:700;color:#0041F9">£${grandTotal.toFixed(2)}</span>
      </div>
    </div>
    ${orderNotes ? `<p style="margin-top:20px;font-size:12px;color:#555"><strong>Order Notes:</strong> ${orderNotes}</p>` : ""}
  </div>
  <div style="background:#f4f4f5;padding:16px 32px;font-size:10px;color:#999;letter-spacing:1px;text-transform:uppercase;display:flex;justify-content:space-between">
    <span>info@elevateworkwear.com</span><span>${ts}</span>
  </div>
</div>
</body></html>`;

      const basketText = [
        `BASKET QUOTE — ${ref}`,
        `Date: ${ts}`,
        ``,
        `CUSTOMER`,
        `Name: ${contact}`,
        `Email: ${email}`,
        ...(company && company !== "—" ? [`Business: ${company}`] : []),
        ...(phone && phone !== "—" ? [`Phone: ${phone}`] : []),
        ``,
        `ITEMS`,
        ...basket.map((item: { productName: string; totalQty: number; totalOrder: number }) =>
          `- ${item.productName}: ${item.totalQty} units — £${item.totalOrder.toFixed(2)}`),
        ``,
        `Grand Total: £${grandTotal.toFixed(2)}`,
        ...(orderNotes ? [`Notes: ${orderNotes}`] : []),
      ].join("\n");

      let sentInfo;
      try {
        sentInfo = await sendMail({
          to:      "info@elevateworkwear.com",
          replyTo: email,                      // replies go directly to the customer
          subject: `Basket Quote — ${ref} — ${totalUnits} units`,
          html: basketHtml,
          text: basketText,
        });
      } catch (err) {
        console.error("Zoho send error:", err);
        return NextResponse.json({ error: "Failed to send email" }, { status: 400 });
      }

      // Save quote to admin DB
      try {
        const now = new Date().toISOString();
        const items: OrderItem[] = basket.map((item: {
          productCode?: string; productName: string; totalQty: number;
          method?: string; positions?: string[];
          basePerUnit: number; brandingCost: number; totalPerUnit: number; totalOrder: number;
          sizeQtys?: Record<string, number>;
        }) => ({
          productCode: item.productCode ?? "",
          productName: item.productName,
          qty: item.totalQty,
          sizeQtys: item.sizeQtys,
          method: (item.method ?? "embroidery") as OrderItem["method"],
          positions: item.positions ?? [],
          basePerUnit: item.basePerUnit,
          brandingPerUnit: item.brandingCost,
          totalPerUnit: item.totalPerUnit,
          lineTotal: item.totalOrder,
        }));
        const profits = await calcQuoteProfits(items);
        const quoteRecord: Quote = {
          id: generateId(),
          reference: ref,
          company: (company as string) || "",
          contact: (contact as string) || "",
          email:   (email as string) || "",
          phone:   (phone as string) || "",
          items,
          orderNotes: orderNotes as string | undefined,
          ...profits,
          status: "new",
          createdAt: now,
          updatedAt: now,
        };
        await insertOne("quotes", quoteRecord);
      } catch {}

      return NextResponse.json({ success: true, id: sentInfo?.messageId, reference: ref });
    }

    const ts = new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });
    const methodLabel = method === "embroidery" ? "Embroidery"
      : method === "print" ? "Print" : "Both (Embroidery + Print)";

    /* ── HTML email body ── */
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Quote Request — ${reference}</title>
<style>
  body{margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif}
  .wrap{max-width:640px;margin:32px auto;background:#fff}
  .hdr{background:#07070A;padding:28px 32px;border-bottom:3px solid #0041F9}
  .hdr-title{color:#fff;font-size:22px;font-weight:700;letter-spacing:2px;margin:0}
  .hdr-sub{color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:6px 0 0}
  .ref-band{background:#0041F9;padding:14px 32px;display:flex;justify-content:space-between;align-items:center}
  .ref-label{color:rgba(255,255,255,0.6);font-size:10px;letter-spacing:2px;text-transform:uppercase}
  .ref-val{color:#fff;font-size:18px;font-weight:700;letter-spacing:3px}
  .body{padding:28px 32px}
  h2{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#0041F9;margin:24px 0 12px;padding-bottom:8px;border-bottom:1px solid #e5e7eb}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;margin-bottom:8px}
  .f label{display:block;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888;margin-bottom:3px}
  .f span{font-size:13px;color:#111}
  .price-box{background:#f9fafb;border:1px solid #e5e7eb;padding:16px 20px;margin-top:8px}
  .price-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0}
  .price-row:last-child{border:none;padding-top:10px;margin-top:4px}
  .price-row.total .pl{font-weight:700;color:#111}
  .price-row.total .pv{font-size:18px;font-weight:700;color:#0041F9}
  .pl{font-size:11px;color:#555;letter-spacing:1px;text-transform:uppercase}
  .pv{font-size:13px;color:#111}
  .footer{background:#f4f4f5;padding:16px 32px;font-size:10px;color:#999;letter-spacing:1px;text-transform:uppercase;display:flex;justify-content:space-between}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <p class="hdr-title">ELEVATE</p>
    <p class="hdr-sub">Workwear Solutions — New Quote Request</p>
  </div>
  <div class="ref-band">
    <span class="ref-label">Reference</span>
    <span class="ref-val">${reference}</span>
  </div>
  <div class="body">
    <h2>Customer Details</h2>
    <div class="grid">
      <div class="f"><label>Company</label><span>${company}</span></div>
      <div class="f"><label>Contact Name</label><span>${contact}</span></div>
      <div class="f"><label>Email</label><span>${email}</span></div>
      <div class="f"><label>Phone</label><span>${phone}</span></div>
      ${title    ? `<div class="f"><label>Job Title</label><span>${title}</span></div>` : ""}
      ${website  ? `<div class="f"><label>Website</label><span>${website}</span></div>` : ""}
      <div class="f"><label>Delivery Postcode</label><span>${postcode}</span></div>
      ${addNotes ? `<div class="f" style="grid-column:1/-1"><label>Additional Notes</label><span>${addNotes}</span></div>` : ""}
    </div>

    <h2>Product Configuration</h2>
    <div class="grid">
      <div class="f"><label>Product</label><span>${productName}</span></div>
      <div class="f"><label>Size</label><span>${size ?? "—"}</span></div>
      <div class="f"><label>Quantity</label><span>${qty} units</span></div>
      <div class="f"><label>Branding Method</label><span>${methodLabel}</span></div>
      <div class="f"><label>Logo Position(s)</label><span>${(positions as string[]).join(", ") || "None"}</span></div>
      ${fileName ? `<div class="f"><label>Logo File</label><span>${fileName} (send separately)</span></div>` : ""}
      ${notes    ? `<div class="f" style="grid-column:1/-1"><label>Product Notes</label><span>${notes}</span></div>` : ""}
    </div>

    <h2>Pricing Breakdown</h2>
    <div class="price-box">
      <div class="price-row"><span class="pl">Base price / unit</span><span class="pv">£${Number(basePerUnit).toFixed(2)}</span></div>
      <div class="price-row"><span class="pl">Branding cost / unit</span><span class="pv">+£${Number(brandingCost).toFixed(2)}</span></div>
      <div class="price-row"><span class="pl">Total / unit</span><span class="pv">£${Number(totalPerUnit).toFixed(2)}</span></div>
      <div class="price-row"><span class="pl">Quantity</span><span class="pv">${qty} units</span></div>
      <div class="price-row total">
        <span class="pl">Estimated Order Total</span>
        <span class="pv" style="font-size:20px;font-weight:700;color:#0041F9">£${Number(totalOrder).toFixed(2)}</span>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>info@elevateworkwear.com</span>
    <span>${ts}</span>
  </div>
</div>
</body>
</html>`;

    /* ── Plain text fallback ── */
    const text = [
      `QUOTE REQUEST — ${reference}`,
      `Date: ${ts}`,
      ``,
      `CUSTOMER`,
      `Company: ${company}`,
      `Contact: ${contact}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      title    ? `Job Title: ${title}` : null,
      website  ? `Website: ${website}` : null,
      `Postcode: ${postcode}`,
      addNotes ? `Notes: ${addNotes}` : null,
      ``,
      `PRODUCT`,
      `Product: ${productName}`,
      `Size: ${size ?? "—"}`,
      `Quantity: ${qty} units`,
      `Branding: ${methodLabel}`,
      `Positions: ${(positions as string[]).join(", ") || "None"}`,
      fileName ? `Logo File: ${fileName}` : null,
      notes    ? `Product Notes: ${notes}` : null,
      ``,
      `PRICING`,
      `Base: £${Number(basePerUnit).toFixed(2)}/unit`,
      `Branding: +£${Number(brandingCost).toFixed(2)}/unit`,
      `Total/unit: £${Number(totalPerUnit).toFixed(2)}`,
      `Order Total: £${Number(totalOrder).toFixed(2)}`,
    ].filter(Boolean).join("\n");

    /* ── Send via Zoho SMTP ── */
    let sentInfo;
    try {
      sentInfo = await sendMail({
        to:      "info@elevateworkwear.com",
        replyTo: email,                      // replies go directly to the customer
        subject: `Quote Request — ${reference} — ${company}`,
        html,
        text,
      });
    } catch (err) {
      console.error("Zoho send error:", err);
      return NextResponse.json({ error: "Failed to send email" }, { status: 400 });
    }

    // Save single-product quote to admin DB
    try {
      const now = new Date().toISOString();
      const item: OrderItem = {
        productCode: "",
        productName: productName as string,
        qty: Number(qty),
        method: (method ?? "embroidery") as OrderItem["method"],
        positions: (positions as string[]) ?? [],
        basePerUnit: Number(basePerUnit),
        brandingPerUnit: Number(brandingCost),
        totalPerUnit: Number(totalPerUnit),
        lineTotal: Number(totalOrder),
      };
      const profits = await calcQuoteProfits([item]);
      const quoteRecord: Quote = {
        id: generateId(),
        reference: reference as string,
        company: company as string,
        contact: contact as string,
        email: email as string,
        phone: phone as string,
        postcode: postcode as string,
        items: [item],
        ...profits,
        status: "new",
        createdAt: now,
        updatedAt: now,
      };
      await insertOne("quotes", quoteRecord);
    } catch {}

    return NextResponse.json({ success: true, id: sentInfo?.messageId, reference });

  } catch (err) {
    console.error("Quote API error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
