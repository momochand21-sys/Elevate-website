import type { Order } from "@/lib/portal-data";
import type { BasketItem } from "@/lib/basket-context";
import { calcLine, type ProductCode, type BrandingMethod } from "@/lib/product-pricing";

export const PRODUCT_META: Record<string, { code: ProductCode; href: string }> = {
  "Premium Workwear Hoodie":  { code:"ELV-001", href:"/products/hoodies/heavyweight-hoodie" },
  "Premium Workwear Polo":    { code:"ELV-002", href:"/products/polo-shirts/workwear-polo" },
  "Premium Workwear Beanie":  { code:"ELV-003", href:"/products/caps-beanies/workwear-beanie" },
  "Premium Workwear Cap":     { code:"ELV-004", href:"/products/caps-beanies/workwear-cap" },
  "Premium Workwear Gilet":   { code:"ELV-005", href:"/products/gilets/workwear-gilet" },
  "Premium Workwear 1/4 Zip": { code:"ELV-006", href:"/products/quarter-zip/workwear-quarter-zip" },
};

/** Build basket items from a portal Order's items[] array using correct product pricing */
export function orderToBasketItems(order: Order): Omit<BasketItem, "id">[] {
  const source = order.items.length > 0 ? order.items : [{
    product:   order.product,
    qty:       order.qty,
    sizes:     order.sizes,
    method:    order.method,
    positions: order.positions,
    logoAsset: order.logoAsset,
    notes:     order.notes,
  }];

  return source.map(item => {
    const meta   = PRODUCT_META[item.product] ?? { code: "ELV-001" as ProductCode, href: "/products" };
    const qty    = Object.values(item.sizes).reduce((s, v) => s + (v || 0), 0) || item.qty;
    const method = (item.method?.toLowerCase().includes("print") && item.method?.toLowerCase().includes("embroid"))
      ? "both" : item.method?.toLowerCase().includes("print")
      ? "print" : "embroidery" as BrandingMethod;

    const { basePerUnit, brandingCost, totalPerUnit, totalOrder } =
      calcLine(meta.code, qty, item.positions, method);

    return {
      productName:  item.product,
      productCode:  meta.code,
      productHref:  meta.href,
      sizeQtys:     { ...item.sizes },
      totalQty:     qty,
      logo:         "yes" as const,
      logoFileName: item.logoAsset,
      method,
      positions:    [...item.positions],
      notes:        item.notes || order.notes,
      basePerUnit,
      brandingCost,
      totalPerUnit,
      totalOrder,
    };
  });
}
