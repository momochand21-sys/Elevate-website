import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-05-27.dahlia" as const,
});

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({
        valid: false,
        reason: `Payment not completed (status: ${session.payment_status})`,
      });
    }

    return NextResponse.json({
      valid:       true,
      amountTotal: session.amount_total,          // pence
      currency:    session.currency,
      metadata:    session.metadata,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
