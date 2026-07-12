import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuoteOrderDocument, type PdfDoc } from "./QuoteOrderDocument";
import type { Quote, Order } from "@/lib/admin/types";

export async function renderQuotePdf(q: Quote): Promise<Buffer> {
  const doc: PdfDoc = {
    kind: "Quote",
    reference: q.reference,
    company: q.company,
    contact: q.contact,
    email: q.email,
    phone: q.phone,
    location: q.postcode,
    date: q.createdAt,
    items: q.items,
    subtotal: q.subtotal,
    discountPercent: q.discountPercent,
    discountAmount: q.discountAmount,
    total: q.totalRevenue,
    notes: q.orderNotes,
  };
  return renderToBuffer(<QuoteOrderDocument doc={doc} />);
}

export async function renderOrderPdf(o: Order): Promise<Buffer> {
  const doc: PdfDoc = {
    kind: "Order Confirmation",
    reference: o.reference,
    company: o.company,
    contact: o.contact,
    email: o.email,
    phone: o.phone,
    location: o.address,
    date: o.createdAt,
    status: o.status.replace(/_/g, " "),
    items: o.items,
    subtotal: o.subtotal,
    discountPercent: o.discountPercent,
    discountAmount: o.discountAmount,
    total: o.totalRevenue,
    notes: o.orderNotes,
  };
  return renderToBuffer(<QuoteOrderDocument doc={doc} />);
}
