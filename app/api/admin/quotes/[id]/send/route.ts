import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { findById, updateOne } from "@/lib/admin/db";
import { buildCustomerQuoteEmail } from "@/lib/admin/quote-email";
import type { Quote } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/quotes/[id]/send
 * Emails the quote to the customer as a formatted HTML table (via Zoho SMTP),
 * then advances the quote from "new" → "sent".
 */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const quote = await findById<Quote>("quotes", params.id);
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  if (!quote.email) {
    return NextResponse.json({ error: "This quote has no customer email address." }, { status: 400 });
  }

  const { subject, html, text } = buildCustomerQuoteEmail(quote);

  try {
    await sendMail({
      to: quote.email,
      replyTo: "info@elevateworkwear.com",
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error("Quote send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 400 });
  }

  // Sending the quote IS the "sent" action — advance status if still new.
  if (quote.status === "new") {
    await updateOne<Quote>("quotes", params.id, {
      status: "sent",
      updatedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true });
}
