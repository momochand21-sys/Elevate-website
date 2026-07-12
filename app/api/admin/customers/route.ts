import { NextRequest, NextResponse } from "next/server";
import { readDb, insertOne, generateId } from "@/lib/admin/db";
import type { Customer } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readDb<Customer>("customers"));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const now = new Date().toISOString();
  const customer: Customer = {
    id: generateId(),
    company: body.company ?? "",
    contact: body.contact ?? "",
    email: body.email ?? "",
    phone: body.phone ?? "",
    address: body.address ?? "",
    notes: body.notes ?? "",
    digitisedLogoStatus: body.digitisedLogoStatus ?? "none",
    savedLogos: body.savedLogos ?? [],
    orderIds: [],
    createdAt: now,
    updatedAt: now,
  };
  await insertOne("customers", customer);
  return NextResponse.json(customer, { status: 201 });
}
