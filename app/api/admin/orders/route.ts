import { NextRequest, NextResponse } from "next/server";
import { readDb, insertOne, generateId, generateRef } from "@/lib/admin/db";
import { calcOrderProfits } from "@/lib/admin/calculations";
import type { Order, OrderItem } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const orders = await readDb<Order>("orders");
  return NextResponse.json(orders.slice().reverse());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const now = new Date().toISOString();

  const items: OrderItem[] = body.items ?? [];
  const costs = {
    digitisingCost: body.costs?.digitisingCost ?? 0,
    packagingCost:  body.costs?.packagingCost  ?? 0,
    paymentFee:     body.costs?.paymentFee     ?? 0,
    shippingCost:   body.costs?.shippingCost   ?? 0,
  };

  const discountPercent = Number(body.discountPercent) || 0;
  const { paymentFee, ...financials } = await calcOrderProfits(items, costs, discountPercent);

  const order: Order = {
    id: generateId(),
    reference: body.reference ?? generateRef("ORD"),
    quoteId: body.quoteId,
    customerId: body.customerId,
    company: body.company ?? "",
    contact: body.contact ?? "",
    email: body.email ?? "",
    phone: body.phone ?? "",
    address: body.address,
    items,
    orderNotes: body.orderNotes,
    costs: { ...costs, paymentFee },
    ...financials,
    status: body.status ?? "payment_pending",
    logoFiles: body.logoFiles ?? [],
    createdAt: now,
    updatedAt: now,
  };

  await insertOne("orders", order);
  return NextResponse.json(order, { status: 201 });
}
