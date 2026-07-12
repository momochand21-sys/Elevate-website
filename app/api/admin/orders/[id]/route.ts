import { NextRequest, NextResponse } from "next/server";
import { findById, updateOne, deleteOne } from "@/lib/admin/db";
import { calcOrderProfits } from "@/lib/admin/calculations";
import type { Order } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const order = await findById<Order>("orders", params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const order = await findById<Order>("orders", params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = body.items ?? order.items;
  const costs = {
    digitisingCost: body.costs?.digitisingCost ?? order.costs.digitisingCost,
    packagingCost:  body.costs?.packagingCost  ?? order.costs.packagingCost,
    paymentFee:     body.costs?.paymentFee     ?? order.costs.paymentFee,
    shippingCost:   body.costs?.shippingCost   ?? order.costs.shippingCost,
  };
  const discountPercent = body.discountPercent !== undefined
    ? Number(body.discountPercent) || 0
    : order.discountPercent ?? 0;

  const { paymentFee, ...financials } = await calcOrderProfits(items, costs, discountPercent);

  const updated = await updateOne<Order>("orders", params.id, {
    ...body,
    items,
    costs: { ...costs, paymentFee },
    ...financials,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const ok = await deleteOne("orders", params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
