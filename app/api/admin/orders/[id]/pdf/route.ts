import { NextRequest, NextResponse } from "next/server";
import { findById } from "@/lib/admin/db";
import { renderOrderPdf } from "@/lib/admin/pdf/render";
import type { Order } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await findById<Order>("orders", params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pdf = await renderOrderPdf(order);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${order.reference}.pdf"`,
    },
  });
}
