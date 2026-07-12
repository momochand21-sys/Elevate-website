import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, generateId } from "@/lib/admin/db";
import type { Product } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readDb<Product>("products"));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const product: Product = {
    ...body,
    code: body.code || `ELV-${generateId().slice(0, 4).toUpperCase()}`,
    updatedAt: new Date().toISOString(),
  };
  const all = await readDb<Product>("products");
  all.push(product);
  await writeDb("products", all);
  return NextResponse.json(product, { status: 201 });
}
