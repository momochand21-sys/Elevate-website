import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/admin/db";
import type { Quote, Order, Product, Customer } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

function toCSV(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
  };
  return [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "orders";

  if (type === "orders") {
    const orders = await readDb<Order>("orders");
    const csv = toCSV(
      ["Reference","Company","Contact","Email","Status","Revenue","Garment Cost","Decoration Cost","Digitising","Packaging","Payment Fee","Shipping","Total Cost","Profit","Margin %","Created"],
      orders.map((o) => [
        o.reference, o.company, o.contact, o.email, o.status,
        o.totalRevenue, o.garmentCost, o.decorationCost,
        o.costs.digitisingCost, o.costs.packagingCost, o.costs.paymentFee, o.costs.shippingCost,
        o.totalJobCost, o.grossProfit, o.margin,
        new Date(o.createdAt).toLocaleDateString("en-GB"),
      ])
    );
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=orders.csv" },
    });
  }

  if (type === "quotes") {
    const quotes = await readDb<Quote>("quotes");
    const csv = toCSV(
      ["Reference","Company","Contact","Email","Status","Revenue","Est. Cost","Profit","Margin %","Created"],
      quotes.map((q) => [
        q.reference, q.company, q.contact, q.email, q.status,
        q.totalRevenue, q.totalCost, q.grossProfit, q.margin,
        new Date(q.createdAt).toLocaleDateString("en-GB"),
      ])
    );
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=quotes.csv" },
    });
  }

  if (type === "products") {
    const products = await readDb<Product>("products");
    const csv = toCSV(
      ["Code","Name","Category","Cost Price","Sell Price","Positions","Sizes","Active"],
      products.map((p) => [
        p.code, p.name, p.category, p.garmentCost, p.garmentSellPrice,
        p.brandingPositions.join("; "), p.sizes.join(", "), p.active ? "Yes" : "No",
      ])
    );
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=products.csv" },
    });
  }

  if (type === "customers") {
    const customers = await readDb<Customer>("customers");
    const csv = toCSV(
      ["Company","Contact","Email","Phone","Address","Logo Status","Notes","Created"],
      customers.map((c) => [
        c.company, c.contact, c.email, c.phone, c.address,
        c.digitisedLogoStatus, c.notes,
        new Date(c.createdAt).toLocaleDateString("en-GB"),
      ])
    );
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=customers.csv" },
    });
  }

  if (type === "profit") {
    const orders = await readDb<Order>("orders");
    const csv = toCSV(
      ["Reference","Company","Revenue","Garment Cost","Decoration Cost","Digitising","Packaging","Payment Fee","Shipping","Total Cost","Gross Profit","Margin %","Markup %","Status"],
      orders.map((o) => [
        o.reference, o.company, o.totalRevenue, o.garmentCost, o.decorationCost,
        o.costs.digitisingCost, o.costs.packagingCost, o.costs.paymentFee, o.costs.shippingCost,
        o.totalJobCost, o.grossProfit, o.margin, o.markup, o.status,
      ])
    );
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=profit-report.csv" },
    });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
