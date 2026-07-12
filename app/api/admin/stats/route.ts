import { NextResponse } from "next/server";
import { readDb } from "@/lib/admin/db";
import type { Quote, Order } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const quotes = await readDb<Quote>("quotes");
  const orders = await readDb<Order>("orders");

  const totalRevenue = orders.reduce((s, o) => s + o.totalRevenue, 0);
  const totalProfit  = orders.reduce((s, o) => s + o.grossProfit, 0);
  const avgMargin    = orders.length
    ? +(orders.reduce((s, o) => s + o.margin, 0) / orders.length).toFixed(1)
    : 0;

  // This-month figures (current calendar month)
  const now = new Date();
  const inThisMonth = (iso: string) => {
    const d = new Date(iso);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };
  const monthOrders = orders.filter((o) => inThisMonth(o.createdAt));
  const thisMonthRevenue = +monthOrders.reduce((s, o) => s + o.totalRevenue, 0).toFixed(2);
  const thisMonthProfit  = +monthOrders.reduce((s, o) => s + o.grossProfit, 0).toFixed(2);
  const avgOrderValue    = orders.length ? +(totalRevenue / orders.length).toFixed(2) : 0;

  // Best customer by total order revenue
  const revenueByCustomer = new Map<string, number>();
  for (const o of orders) {
    if (!o.company) continue;
    revenueByCustomer.set(o.company, (revenueByCustomer.get(o.company) ?? 0) + o.totalRevenue);
  }
  let bestCustomer = "—", bestCustomerRevenue = 0;
  for (const [company, rev] of revenueByCustomer) {
    if (rev > bestCustomerRevenue) { bestCustomer = company; bestCustomerRevenue = +rev.toFixed(2); }
  }

  // Most-ordered product by total units across all order items
  const qtyByProduct = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.items) {
      if (!it.productName) continue;
      qtyByProduct.set(it.productName, (qtyByProduct.get(it.productName) ?? 0) + (it.qty || 0));
    }
  }
  let topProduct = "—", topProductQty = 0;
  for (const [name, qty] of qtyByProduct) {
    if (qty > topProductQty) { topProduct = name; topProductQty = qty; }
  }

  const stats = {
    totalQuotes:        quotes.length,
    totalOrders:        orders.length,
    totalRevenue:       +totalRevenue.toFixed(2),
    totalProfit:        +totalProfit.toFixed(2),
    avgMargin,
    pendingQuotes:      quotes.filter((q) => q.status === "new").length,
    ordersInProduction: orders.filter((o) =>
      ["sent_to_supplier", "in_production", "quality_check"].includes(o.status)
    ).length,
    completedOrders:    orders.filter((o) => o.status === "completed").length,
    thisMonthRevenue,
    thisMonthProfit,
    avgOrderValue,
    bestCustomer,
    bestCustomerRevenue,
    topProduct,
    topProductQty,
  };

  return NextResponse.json(stats);
}
