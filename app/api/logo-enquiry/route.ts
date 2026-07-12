import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { name, business, email, phone, service, details } = await req.json();

    const serviceLabel =
      service === "new-logo"     ? "New Logo Design" :
      service === "digitise"     ? "Logo Digitisation for Embroidery" :
      service === "both"         ? "New Logo + Digitisation" :
      "Logo Enquiry";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#f5f5f3;padding:32px;border:1px solid #1a1a2e;">
        <div style="border-bottom:2px solid #0041F9;padding-bottom:16px;margin-bottom:24px;">
          <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0;letter-spacing:0.04em;">
            LOGO SERVICES ENQUIRY
          </h1>
          <p style="color:#0041F9;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;margin:6px 0 0;">
            Elevate Workwear Solutions
          </p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;width:140px">Name</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;font-size:14px;color:#f5f5f3">${name}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em">Business</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;font-size:14px;color:#f5f5f3">${business || "—"}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em">Email</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;font-size:14px;color:#f5f5f3">${email}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em">Phone</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;font-size:14px;color:#f5f5f3">${phone || "—"}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em">Service</td>
              <td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;font-size:14px;color:#0041F9;font-weight:700">${serviceLabel}</td></tr>
        </table>

        ${details ? `
        <div style="background:#111;border:1px solid #222;padding:16px;margin-bottom:24px;">
          <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Additional Details</p>
          <p style="font-size:14px;color:#f5f5f3;margin:0;line-height:1.6">${details}</p>
        </div>` : ""}

        <p style="font-size:11px;color:#555;text-align:center;margin:0">
          Elevate Workwear Solutions · Logo Services Enquiry
        </p>
      </div>
    `;

    await sendMail({
      to:   "info@elevateworkwear.com",
      replyTo: email,
      subject: `Logo Enquiry — ${serviceLabel} — ${name}${business ? ` (${business})` : ""}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Logo enquiry error:", err);
    return NextResponse.json({ error: "Failed to send enquiry" }, { status: 500 });
  }
}
