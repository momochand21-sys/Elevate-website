import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { calcLine, getBrandingCost, getUnitPrice, type ProductCode, type BrandingMethod } from "@/lib/product-pricing";
import { BUNDLES } from "@/lib/bundles";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-05-27.dahlia" as const,
});

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

/* ── Maximum tolerated difference between client total and server total (pence) ── */
const MAX_PRICE_DRIFT_PENCE = 2;   // ±£0.02 to account for float rounding

/* ── Validate and re-price a single basket item server-side ── */
function serverPriceItem(item: {
  productCode?: string;
  bundleSlug?:  string;
  isBundle?:    boolean;
  totalQty:     number;
  method?:      string;
  positions?:   string[];
  /* client-reported totals — used only for drift check */
  clientTotalOrder: number;
}): {
  serverTotalOrder: number;
  basePerUnit:      number;
  brandingCost:     number;
  error?:           string;
} {
  /* ── Bundle pricing ── */
  if (item.isBundle && item.bundleSlug) {
    const bundle = BUNDLES.find(b => b.slug === item.bundleSlug);
    if (!bundle) return { serverTotalOrder: 0, basePerUnit: 0, brandingCost: 0, error: `Unknown bundle slug: ${item.bundleSlug}` };

    /* Bundle base price is fixed server-side */
    const serverBase = bundle.bundlePrice;
    /* Optional extra branding add-ons on top of included branding */
    const includedPos = bundle.includedBranding?.position ? [bundle.includedBranding.position] : [];
    const addonPositions = (item.positions ?? []).filter(p => !includedPos.includes(p));
    const addonRate = bundle.addonMethod === "embroidery" ? "embroidery" : "print";
    const brandingCost = getBrandingCost(addonPositions, addonRate as BrandingMethod);
    const serverTotalOrder = +(serverBase + brandingCost * item.totalQty).toFixed(2);
    return { serverTotalOrder, basePerUnit: +(bundle.bundlePrice / item.totalQty).toFixed(2), brandingCost };
  }

  /* ── Standard garment pricing ── */
  const code = item.productCode as ProductCode | undefined;
  if (!code) return { serverTotalOrder: 0, basePerUnit: 0, brandingCost: 0, error: "Missing productCode" };

  const method = (item.method ?? "embroidery") as BrandingMethod;
  const { basePerUnit, brandingCost, totalOrder } = calcLine(code, item.totalQty, item.positions ?? [], method);

  return { serverTotalOrder: totalOrder, basePerUnit, brandingCost };
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { basket, orderNotes } = body;

    /* ─────────────────────────────────────────────────────
       BASKET CHECKOUT
    ───────────────────────────────────────────────────── */
    if (Array.isArray(basket) && basket.length > 0) {
      /* Sanity cap — prevent abuse */
      if (basket.length > 50) {
        return NextResponse.json({ error: "Basket too large" }, { status: 400 });
      }

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      let serverGrandTotal = 0;
      let clientGrandTotal = 0;

      for (const item of basket) {
        const clientTotal: number = typeof item.totalOrder === "number" ? item.totalOrder : 0;
        clientGrandTotal += clientTotal;

        const { serverTotalOrder, basePerUnit, brandingCost, error } = serverPriceItem({
          productCode:      item.productCode,
          bundleSlug:       item.bundleSlug,
          isBundle:         !!item.isBundle,
          totalQty:         Number(item.totalQty) || 1,
          method:           item.method,
          positions:        item.positions,
          clientTotalOrder: clientTotal,
        });

        if (error) {
          return NextResponse.json({ error: `Pricing error: ${error}` }, { status: 400 });
        }

        /* Drift check — reject if client price is manipulated */
        const driftPence = Math.abs(Math.round(serverTotalOrder * 100) - Math.round(clientTotal * 100));
        if (driftPence > MAX_PRICE_DRIFT_PENCE) {
          console.warn(`[checkout] Price mismatch on ${item.productCode}: client=£${clientTotal} server=£${serverTotalOrder} drift=£${(driftPence/100).toFixed(2)}`);
          return NextResponse.json({
            error: "Price mismatch. Please refresh the page and try again.",
          }, { status: 400 });
        }

        serverGrandTotal += serverTotalOrder;

        /* Build description */
        const methodLabel = item.method === "print" ? "Print"
          : item.method === "both" ? "Embroidery + Print" : "Embroidery";

        const sizeDesc = item.sizeQtys
          ? Object.entries(item.sizeQtys as Record<string,number>)
              .filter(([, q]) => q > 0)
              .map(([s, q]) => `${q}×${s}`)
              .join(", ")
          : `${item.totalQty} units`;

        const description = [
          sizeDesc,
          `Branding: ${methodLabel}`,
          (item.positions as string[] ?? []).length
            ? `Positions: ${(item.positions as string[]).join(", ")}`
            : null,
          brandingCost > 0 ? `Branding: +£${brandingCost.toFixed(2)}/unit` : null,
        ].filter(Boolean).join(" · ");

        if (item.isBundle && item.bundleContents) {
          /* Bundle — single line at server-verified price */
          const contents = (item.bundleContents as {name:string;qty:number;sizeQtys?:Record<string,number>}[])
            .map(c => {
              const sz = c.sizeQtys
                ? Object.entries(c.sizeQtys).filter(([,q])=>q>0).map(([s,q])=>`${q}×${s}`).join("/")
                : "";
              return `${c.qty}× ${c.name.replace("Premium Workwear ","")}${sz?` (${sz})`:""}`;
            }).join(", ");
          lineItems.push({
            price_data: {
              currency: "gbp",
              unit_amount: Math.round(serverTotalOrder * 100),
              product_data: { name: `${item.productName} (${item.productCode})`, description: `${contents} · ${description}` },
            },
            quantity: 1,
          });
        } else {
          /* Standard item — server-priced per unit */
          lineItems.push({
            price_data: {
              currency: "gbp",
              unit_amount: Math.round(+((serverTotalOrder / (Number(item.totalQty)||1)).toFixed(2)) * 100),
              product_data: { name: `${item.productName} (${item.productCode})`, description },
            },
            quantity: Number(item.totalQty),
          });
        }
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: lineItems,
        success_url: `${BASE}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:  `${BASE}/basket`,
        metadata: {
          type:           "basket",
          items_count:    String(basket.length),
          server_total:   serverGrandTotal.toFixed(2),
          ...(orderNotes ? { order_notes: String(orderNotes).slice(0, 500) } : {}),
        },
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Invalid request — use basket format" }, { status: 400 });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe checkout error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
