import { NextRequest, NextResponse } from "next/server";
import { findById, updateOne, deleteOne } from "@/lib/admin/db";
import type { Lead } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const lead = await findById<Lead>("leads", params.id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await updateOne<Lead>("leads", params.id, {
    ...body,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const ok = await deleteOne("leads", params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
