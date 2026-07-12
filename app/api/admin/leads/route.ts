import { NextRequest, NextResponse } from "next/server";
import { readDb, insertOne, generateId } from "@/lib/admin/db";
import type { Lead } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const leads = await readDb<Lead>("leads");
  // Newest first
  leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const now = new Date().toISOString();
  const lead: Lead = {
    id: generateId(),
    company: body.company ?? "",
    contact: body.contact ?? "",
    email: body.email ?? "",
    phone: body.phone ?? "",
    address: body.address ?? "",
    source: body.source ?? "",
    notes: body.notes ?? "",
    status: body.status ?? "new",
    createdAt: now,
    updatedAt: now,
  };
  await insertOne("leads", lead);
  return NextResponse.json(lead, { status: 201 });
}
