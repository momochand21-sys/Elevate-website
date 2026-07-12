import { NextRequest, NextResponse } from "next/server";
import { readDb, insertOne, generateId, generateRef } from "@/lib/admin/db";
import { calcQuoteProfits } from "@/lib/admin/calculations";
import type { Quote, OrderItem } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const quotes = await readDb<Quote>("quotes");
  return NextResponse.json(quotes.slice().reverse());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const now = new Date().toISOString();

  const items: OrderItem[] = (body.items ?? []).map((i: Partial<OrderItem> & { qty?: number; basePerUnit?: number; brandingPerUnit?: number; totalPerUnit?: number; lineTotal?: number }) => ({
    ...i,
    qty: i.qty ?? 0,
    basePerUnit: i.basePerUnit ?? 0,
    brandingPerUnit: i.brandingPerUnit ?? 0,
    totalPerUnit: i.totalPerUnit ?? 0,
    lineTotal: i.lineTotal ?? 0,
  }));

  const discountPercent = Number(body.discountPercent) || 0;
  const { subtotal, discountAmount, totalRevenue, totalCost, grossProfit, margin } = await calcQuoteProfits(items, discountPercent);

  const quote: Quote = {
    id: generateId(),
    reference: body.reference ?? generateRef("QTE"),
    customerId: body.customerId,
    company: body.company ?? "",
    contact: body.contact ?? "",
    email: body.email ?? "",
    phone: body.phone ?? "",
    postcode: body.postcode,
    items,
    orderNotes: body.orderNotes,
    subtotal,
    discountPercent,
    discountAmount,
    totalRevenue,
    totalCost,
    grossProfit,
    margin,
    status: "new",
    createdAt: now,
    updatedAt: now,
  };

  await insertOne("quotes", quote);
  return NextResponse.json(quote, { status: 201 });
}
