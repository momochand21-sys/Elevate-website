import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/admin/db";
import type { Product } from "@/lib/admin/types";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { code: string } }) {
  const products = await readDb<Product>("products");
  const product = products.find((p) => p.code === params.code);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: { code: string } }) {
  const body = await req.json();
  const products = await readDb<Product>("products");
  const idx = products.findIndex((p) => p.code === params.code);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  products[idx] = { ...products[idx], ...body, code: params.code, updatedAt: new Date().toISOString() };
  await writeDb("products", products);

  if (body.syncWebsite) {
    try {
      syncProductPricingTs(products);
    } catch (e) {
      console.error("Failed to sync product-pricing.ts", e);
    }
  }

  return NextResponse.json(products[idx]);
}

export async function DELETE(_: NextRequest, { params }: { params: { code: string } }) {
  const products = await readDb<Product>("products");
  const next = products.filter((p) => p.code !== params.code);
  if (next.length === products.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await writeDb("products", next);
  return NextResponse.json({ success: true });
}

/** Regenerate lib/product-pricing.ts from the products DB */
function syncProductPricingTs(products: Product[]) {
  const active = products.filter((p) => p.active);

  const productCodes = active.map((p) => `  | "${p.code}"`).join("\n");
  const tierEntries = active.map((p) => {
    const tiers = p.volumeTiers
      .map((t) => `    { min: ${t.min},  max: ${t.max === 999999 ? "Infinity" : t.max}, price: ${t.price.toFixed(2)} },`)
      .join("\n");
    return `  "${p.code}": [\n${tiers}\n  ],`;
  }).join("\n");

  const basePriceEntries = active.map((p) =>
    `  "${p.code}": ${p.garmentSellPrice.toFixed(2)},`
  ).join("\n");

  const positionPriceEntries = (() => {
    const positions: Record<string, { embroidery: number; print: number }> = {};
    for (const p of active) {
      for (const [pos, prices] of Object.entries(p.decorationSellPrices)) {
        if (!positions[pos]) positions[pos] = prices;
      }
    }
    return Object.entries(positions).map(([pos, prices]) =>
      `  "${pos}": { embroidery: ${prices.embroidery.toFixed(2)}, print: ${prices.print.toFixed(2)} },`
    ).join("\n");
  })();

  const content = `/* ─────────────────────────────────────────────────────────────────
   CENTRAL PRODUCT PRICING — auto-generated from admin products DB
   Last synced: ${new Date().toISOString()}
   DO NOT edit manually — update via /admin/products and click Sync
─────────────────────────────────────────────────────────────────── */

export type ProductCode =\n${productCodes};

export type BrandingMethod = "embroidery" | "print" | "both";

export interface PriceTier {
  min:   number;
  max:   number;
  price: number;
}

export const PRODUCT_TIERS: Record<ProductCode, PriceTier[]> = {
${tierEntries}
};

export const PRODUCT_BASE_PRICE: Record<ProductCode, number> = {
${basePriceEntries}
};

export const POSITION_PRICE: Record<string, Record<"embroidery"|"print", number>> = {
${positionPriceEntries}
};

export const BRANDING_BREAKPOINTS = [25, 50, 100, 250] as const;

export function getUnitPrice(code: ProductCode, qty: number): number {
  const tiers = PRODUCT_TIERS[code];
  if (!tiers) return 0;
  return tiers.find(t => qty >= t.min && qty <= t.max)?.price ?? PRODUCT_BASE_PRICE[code] ?? 0;
}

export function getPositionPrice(position: string, method: "embroidery" | "print", _qty: number): number {
  return POSITION_PRICE[position]?.[method] ?? 0;
}

export function getBrandingCost(positions: string[], method: BrandingMethod, qty = 1): number {
  const key = method === "both" ? "embroidery" : method;
  return positions.reduce((s, p) => s + getPositionPrice(p, key, qty), 0);
}

export function calcLine(
  code: ProductCode, qty: number, positions: string[], method: BrandingMethod
): { basePerUnit: number; brandingCost: number; totalPerUnit: number; totalOrder: number } {
  const basePerUnit  = getUnitPrice(code, qty);
  const brandingCost = getBrandingCost(positions, method, qty);
  const totalPerUnit = basePerUnit + brandingCost;
  const totalOrder   = +(totalPerUnit * qty).toFixed(2);
  return { basePerUnit, brandingCost, totalPerUnit, totalOrder };
}

export function getPositionTiers(position: string) {
  return [{ min: 1, max: 999999, ...POSITION_PRICE[position] }];
}
`;

  const filePath = path.join(process.cwd(), "lib", "product-pricing.ts");
  fs.writeFileSync(filePath, content, "utf-8");
}
