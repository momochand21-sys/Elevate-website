import { NextRequest, NextResponse } from "next/server";
import { findById } from "@/lib/admin/db";
import { renderQuotePdf } from "@/lib/admin/pdf/render";
import type { Quote } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const quote = await findById<Quote>("quotes", params.id);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pdf = await renderQuotePdf(quote);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.reference}.pdf"`,
    },
  });
}
