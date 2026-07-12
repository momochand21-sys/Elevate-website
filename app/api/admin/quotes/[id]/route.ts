import { NextRequest, NextResponse } from "next/server";
import { findById, updateOne, deleteOne, insertOne, generateId, generateRef } from "@/lib/admin/db";
import { calcOrderProfits, calcQuoteProfits } from "@/lib/admin/calculations";
import type { Quote, Order } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const quote = await findById<Quote>("quotes", params.id);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const existing = await findById<Quote>("quotes", params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Recalculate financials whenever items or the discount change, so the quote
  // total/profit/margin can never drift out of sync with what's stored.
  const items = body.items ?? existing.items;
  const discountPercent = body.discountPercent !== undefined
    ? Number(body.discountPercent) || 0
    : existing.discountPercent ?? 0;
  const { subtotal, discountAmount, totalRevenue, totalCost, grossProfit, margin } = await calcQuoteProfits(items, discountPercent);

  const updated = await updateOne<Quote>("quotes", params.id, {
    ...body,
    items,
    subtotal,
    discountPercent,
    discountAmount,
    totalRevenue,
    totalCost,
    grossProfit,
    margin,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const ok = await deleteOne("quotes", params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

/** POST /api/admin/quotes/[id]/convert — convert approved quote to order */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const quote = await findById<Quote>("quotes", params.id);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const action = body.action as string;

  if (action === "convert") {
    const now = new Date().toISOString();
    const costs = {
      digitisingCost: body.digitisingCost ?? 0,
      packagingCost:  body.packagingCost  ?? 0,
      paymentFee:     body.paymentFee     ?? 0,
      shippingCost:   body.shippingCost   ?? 0,
    };
    // Carry the quote's discount through so the order reflects the same price the customer agreed to
    const { paymentFee, ...financials } = await calcOrderProfits(quote.items, costs, quote.discountPercent ?? 0);
    const orderId = generateId();
    const order: Order = {
      id: orderId,
      reference: generateRef("ORD"),
      quoteId: quote.id,
      customerId: quote.customerId,
      company: quote.company,
      contact: quote.contact,
      email: quote.email,
      phone: quote.phone,
      items: quote.items,
      orderNotes: quote.orderNotes,
      costs: { ...costs, paymentFee },
      ...financials,
      status: "payment_pending",
      createdAt: now,
      updatedAt: now,
    };
    await insertOne("orders", order);

    await updateOne<Quote>("quotes", params.id, {
      status: "converted",
      orderId,
      updatedAt: now,
    });

    return NextResponse.json({ order });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
