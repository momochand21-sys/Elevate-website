import type { BrandingMethod, Order, OrderItem, OrderCosts, Product } from "./types";
import { readDb } from "./db";

/** Stripe UK card fee: 1.4% + £0.20 */
export function stripeFee(revenue: number): number {
  return +(revenue * 0.014 + 0.20).toFixed(2);
}

/* ── pure lookups against an already-loaded product list ──────────────── */

function costOf(products: Product[], code: string): number {
  return products.find((p) => p.code === code)?.garmentCost ?? 0;
}

function decoOf(
  products: Product[],
  code: string,
  positions: string[],
  method: BrandingMethod
): number {
  const product = products.find((p) => p.code === code);
  if (!product) return 0;
  const key = method === "both" ? "embroidery" : method;
  return positions.reduce(
    (sum, pos) => sum + (product.decorationCosts[pos]?.[key] ?? 0),
    0
  );
}

/** Look up a single product's garment cost from the DB. */
export async function getProductCost(code: string): Promise<number> {
  const products = await readDb<Product>("products");
  return costOf(products, code);
}

/** Get decoration cost for a set of positions + method (looked up from the DB). */
export async function getDecorationCostPerUnit(
  code: string,
  positions: string[],
  method: BrandingMethod
): Promise<number> {
  const products = await readDb<Product>("products");
  return decoOf(products, code, positions, method);
}

/** Clamp a discount percentage to a sane 0–100 range */
function clampDiscount(discountPercent: number): number {
  return Math.min(100, Math.max(0, discountPercent || 0));
}

/** Split a subtotal into { subtotal, discountPercent, discountAmount, totalRevenue } */
function applyDiscount(subtotal: number, discountPercent: number) {
  const pct = clampDiscount(discountPercent);
  const discountAmount = +(subtotal * (pct / 100)).toFixed(2);
  const totalRevenue = +(subtotal - discountAmount).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), discountPercent: pct, discountAmount, totalRevenue };
}

/** Calculate profit breakdown for an order. `discountPercent` (e.g. 20 = 20% off)
 *  is taken off the items subtotal before any costs or fees are applied — Stripe
 *  fees are based on the discounted amount actually charged to the customer. */
export async function calcOrderProfits(
  items: OrderItem[],
  costs: OrderCosts,
  discountPercent = 0
): Promise<{
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  totalRevenue: number;
  garmentCost: number;
  decorationCost: number;
  paymentFee: number;
  totalJobCost: number;
  grossProfit: number;
  margin: number;
  markup: number;
}> {
  const products = await readDb<Product>("products");
  const itemsSubtotal = +items.reduce((s, i) => s + i.lineTotal, 0).toFixed(2);
  const { subtotal, discountPercent: pct, discountAmount, totalRevenue } = applyDiscount(itemsSubtotal, discountPercent);

  const garmentCost = +items.reduce((s, i) => {
    const gc = i.garmentCostPerUnit ?? costOf(products, i.productCode);
    return s + gc * i.qty;
  }, 0).toFixed(2);

  const decorationCost = +items.reduce((s, i) => {
    const dc = i.decorationCostPerUnit ?? decoOf(products, i.productCode, i.positions, i.method);
    return s + dc * i.qty;
  }, 0).toFixed(2);

  const paymentFee = costs.paymentFee > 0 ? costs.paymentFee : stripeFee(totalRevenue);

  const totalJobCost = +(
    garmentCost +
    decorationCost +
    costs.digitisingCost +
    costs.packagingCost +
    paymentFee +
    costs.shippingCost
  ).toFixed(2);

  const grossProfit = +(totalRevenue - totalJobCost).toFixed(2);
  const margin = totalRevenue > 0 ? +((grossProfit / totalRevenue) * 100).toFixed(1) : 0;
  const markup = totalJobCost > 0 ? +((grossProfit / totalJobCost) * 100).toFixed(1) : 0;

  return { subtotal, discountPercent: pct, discountAmount, totalRevenue, garmentCost, decorationCost, paymentFee, totalJobCost, grossProfit, margin, markup };
}

/** Quick profit estimate for a quote (no extra costs). `discountPercent` (e.g. 20
 *  for 20% off) is deducted from the items subtotal to produce the real revenue
 *  figure — profit and margin are then calculated on what the customer actually pays. */
export async function calcQuoteProfits(items: OrderItem[], discountPercent = 0): Promise<{
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  margin: number;
}> {
  const products = await readDb<Product>("products");
  const itemsSubtotal = +items.reduce((s, i) => s + i.lineTotal, 0).toFixed(2);
  const { subtotal, discountPercent: pct, discountAmount, totalRevenue } = applyDiscount(itemsSubtotal, discountPercent);

  const totalCost = +items.reduce((s, i) => {
    const gc = i.garmentCostPerUnit ?? costOf(products, i.productCode);
    const dc = i.decorationCostPerUnit ?? decoOf(products, i.productCode, i.positions, i.method);
    return s + (gc + dc) * i.qty;
  }, 0).toFixed(2);

  const grossProfit = +(totalRevenue - totalCost).toFixed(2);
  const margin = totalRevenue > 0 ? +((grossProfit / totalRevenue) * 100).toFixed(1) : 0;

  return { subtotal, discountPercent: pct, discountAmount, totalRevenue, totalCost, grossProfit, margin };
}

/** Build a complete Order object with calculated financials */
export async function buildOrderFromQuote(
  order: Omit<Order, "totalRevenue" | "garmentCost" | "decorationCost" | "totalJobCost" | "grossProfit" | "margin" | "markup">
): Promise<Order> {
  const { paymentFee, ...financials } = await calcOrderProfits(order.items, order.costs);
  return { ...order, costs: { ...order.costs, paymentFee }, ...financials };
}
