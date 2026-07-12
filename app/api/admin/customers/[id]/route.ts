import { NextRequest, NextResponse } from "next/server";
import { findById, updateOne, deleteOne, readDb } from "@/lib/admin/db";
import type { Customer, Quote, Order } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const customer = await findById<Customer>("customers", params.id);
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const quotes = (await readDb<Quote>("quotes")).filter((q) => q.customerId === params.id);
  const orders = (await readDb<Order>("orders")).filter((o) => o.customerId === params.id);

  return NextResponse.json({ customer, quotes, orders });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await updateOne<Customer>("customers", params.id, {
    ...body,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const ok = await deleteOne("customers", params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
