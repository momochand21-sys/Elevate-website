/* ─────────────────────────────────────────────────────────────────
   CENTRAL PRODUCT PRICING — single source of truth
   All QuoteFlows, reorder utils, and basket editors read from here.
─────────────────────────────────────────────────────────────────── */

export type ProductCode =
  | "ELV-001" | "ELV-002" | "ELV-003"
  | "ELV-004" | "ELV-005" | "ELV-006";

export type BrandingMethod = "embroidery" | "print" | "both";

export interface PriceTier {
  min:   number;
  max:   number;
  price: number;
}

/* ── Per-product volume pricing tiers ── */
export const PRODUCT_TIERS: Record<ProductCode, PriceTier[]> = {
  "ELV-001": [ // Hoodie
    { min: 10,  max: 24,       price: 25.99 },
    { min: 25,  max: 49,       price: 25.49 },
    { min: 50,  max: 99,       price: 23.99 },
    { min: 100, max: 249,      price: 22.49 },
    { min: 250, max: Infinity, price: 20.99 },
  ],
  "ELV-002": [ // Polo
    { min: 10,  max: 24,       price: 12.99 },
    { min: 25,  max: 49,       price: 11.99 },
    { min: 50,  max: 99,       price: 10.99 },
    { min: 100, max: 249,      price: 10.49 },
    { min: 250, max: Infinity, price:  9.99 },
  ],
  "ELV-003": [ // Beanie
    { min: 10,  max: 24,       price: 6.99 },
    { min: 25,  max: 49,       price: 6.49 },
    { min: 50,  max: 99,       price: 5.99 },
    { min: 100, max: 249,      price: 5.49 },
    { min: 250, max: Infinity, price: 5.19 },
  ],
  "ELV-004": [ // Cap
    { min: 10,  max: 24,       price: 7.99 },
    { min: 25,  max: 49,       price: 7.49 },
    { min: 50,  max: 99,       price: 6.99 },
    { min: 100, max: 249,      price: 6.49 },
    { min: 250, max: Infinity, price: 5.99 },
  ],
  "ELV-005": [ // Gilet
    { min: 10,  max: 24,       price: 26.99 },
    { min: 25,  max: 49,       price: 25.49 },
    { min: 50,  max: 99,       price: 23.99 },
    { min: 100, max: 249,      price: 22.49 },
    { min: 250, max: Infinity, price: 21.49 },
  ],
  "ELV-006": [ // 1/4 Zip
    { min: 10,  max: 24,       price: 24.99 },
    { min: 25,  max: 49,       price: 23.99 },
    { min: 50,  max: 99,       price: 22.99 },
    { min: 100, max: 249,      price: 21.49 },
    { min: 250, max: Infinity, price: 19.99 },
  ],
};

/** Fallback retail price when qty < 10 (or no tier found) */
export const PRODUCT_BASE_PRICE: Record<ProductCode, number> = {
  "ELV-001": 25.99,
  "ELV-002": 12.99,
  "ELV-003": 6.99,
  "ELV-004": 7.99,
  "ELV-005": 26.99,
  "ELV-006": 24.99,
};

/* ── Tiered branding pricing — drops at 25 / 50 / 100 / 250 units ── */
interface BrandingTier { min: number; max: number; embroidery: number; print: number }

const CHEST_TIERS: BrandingTier[] = [
  { min: 1,   max: 24,       embroidery: 3.50, print: 1.67 },
  { min: 25,  max: 49,       embroidery: 3.00, print: 1.40 },
  { min: 50,  max: 99,       embroidery: 2.50, print: 1.15 },
  { min: 100, max: 249,      embroidery: 2.00, print: 0.90 },
  { min: 250, max: Infinity, embroidery: 1.75, print: 0.75 },
];

const BACK_TIERS: BrandingTier[] = [
  { min: 1,   max: 24,       embroidery: 5.00, print: 2.50 },
  { min: 25,  max: 49,       embroidery: 4.25, print: 2.10 },
  { min: 50,  max: 99,       embroidery: 3.50, print: 1.75 },
  { min: 100, max: 249,      embroidery: 2.75, print: 1.40 },
  { min: 250, max: Infinity, embroidery: 2.25, print: 1.15 },
];

const SHOULDER_TIERS: BrandingTier[] = [
  { min: 1,   max: 24,       embroidery: 1.50, print: 1.00 },
  { min: 25,  max: 49,       embroidery: 1.25, print: 0.85 },
  { min: 50,  max: 99,       embroidery: 1.00, print: 0.70 },
  { min: 100, max: 249,      embroidery: 0.85, print: 0.60 },
  { min: 250, max: Infinity, embroidery: 0.75, print: 0.50 },
];

const POSITION_TIER_MAP: Record<string, BrandingTier[]> = {
  "Left Chest":     CHEST_TIERS,
  "Right Chest":    CHEST_TIERS,
  "Front Chest":    CHEST_TIERS,
  "Front Centre":   CHEST_TIERS,
  "Back":           BACK_TIERS,
  "Left Shoulder":  SHOULDER_TIERS,
  "Right Shoulder": SHOULDER_TIERS,
};

/** Flat base prices (qty < 25) — used as display fallback */
export const POSITION_PRICE: Record<string, Record<"embroidery"|"print", number>> = {
  "Left Chest":     { embroidery: 3.50, print: 1.67 },
  "Right Chest":    { embroidery: 3.50, print: 1.67 },
  "Front Chest":    { embroidery: 3.50, print: 1.67 },
  "Front Centre":   { embroidery: 3.50, print: 1.67 },
  "Back":           { embroidery: 5.00, print: 2.50 },
  "Left Shoulder":  { embroidery: 1.50, print: 1.00 },
  "Right Shoulder": { embroidery: 1.50, print: 1.00 },
};

/** All quantity breakpoints where branding price changes */
export const BRANDING_BREAKPOINTS = [25, 50, 100, 250] as const;

/** Get price for a single position at a given quantity */
export function getPositionPrice(
  position: string,
  method: "embroidery" | "print",
  qty: number
): number {
  const tiers = POSITION_TIER_MAP[position] ?? CHEST_TIERS;
  const tier = tiers.find(t => qty >= t.min && qty <= t.max);
  return tier?.[method] ?? POSITION_PRICE[position]?.[method] ?? 0;
}

/** Get all tiers for a position (for displaying the discount table) */
export function getPositionTiers(position: string): BrandingTier[] {
  return POSITION_TIER_MAP[position] ?? CHEST_TIERS;
}

/** Get the correct unit price for a product at a given quantity */
export function getUnitPrice(code: ProductCode, qty: number): number {
  const tiers = PRODUCT_TIERS[code];
  if (!tiers) return 0;
  return tiers.find(t => qty >= t.min && qty <= t.max)?.price
    ?? PRODUCT_BASE_PRICE[code]
    ?? 0;
}

/** Get total branding cost per unit for given positions and method, qty-aware */
export function getBrandingCost(
  positions: string[],
  method: BrandingMethod,
  qty = 1
): number {
  const key = method === "both" ? "embroidery" : method;
  return positions.reduce((s, p) => s + getPositionPrice(p, key, qty), 0);
}

/** Full pricing calculation for a basket line */
export function calcLine(
  code: ProductCode,
  qty: number,
  positions: string[],
  method: BrandingMethod
): { basePerUnit: number; brandingCost: number; totalPerUnit: number; totalOrder: number } {
  const basePerUnit  = getUnitPrice(code, qty);
  const brandingCost = getBrandingCost(positions, method, qty);
  const totalPerUnit = basePerUnit + brandingCost;
  const totalOrder   = +(totalPerUnit * qty).toFixed(2);
  return { basePerUnit, brandingCost, totalPerUnit, totalOrder };
}
