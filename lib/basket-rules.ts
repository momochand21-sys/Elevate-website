import type { BasketItem } from "@/lib/basket-context";

/**
 * A "complex" item is one that mixes embroidery AND print on the same
 * garment (method === "both"). This requires manual quoting because it
 * involves two separate production processes.
 */
export function isComplexItem(item: BasketItem): boolean {
  return !item.isBundle && item.method === "both";
}

/**
 * Determine whether the basket can proceed straight to Stripe checkout,
 * or whether a quote is required.
 *
 * CHECKOUT if ALL of the following are true:
 *   1. No item uses method "both" (no complex mixed-process items)
 *   2. Either:
 *      a. Every item in the basket is a bundle (pre-priced, no minimum), OR
 *      b. Total unit count is ≥ 10
 *
 * QUOTE if:
 *   - Any item is complex (method === "both"), OR
 *   - Non-bundle items exist AND total qty < 10
 */
export function basketQualifiesForCheckout(items: BasketItem[]): boolean {
  // The public site is quote-only: prices are never shown and every order
  // goes through a personalised quote rather than online payment.
  void items;
  return false;
}

/**
 * Human-readable explanation shown below the CTA button.
 */
export function checkoutStatusMessage(items: BasketItem[], totalQty: number): string {
  void totalQty;
  if (items.length === 0) return "";
  return "We'll prepare a personalised quote and get back to you within 1 business day.";
}
