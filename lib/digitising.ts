/* ─────────────────────────────────────────────────────────────────────
   DIGITISING LOGIC — Elevate Workwear Solutions

   Policy:
   · FREE on all orders over £200
   · FREE on all bundle orders
   · FREE if customer uploads an embroidery-ready file
   · £10 one-time fee on orders under £200 with a standard logo file
   · Never charged twice — future orders using the same logo are free
─────────────────────────────────────────────────────────────────────── */

/** File extensions that are already embroidery-ready — no fee */
export const EMBROIDERY_EXTENSIONS = [".dst", ".pes", ".exp", ".dsb"] as const;

/** File extensions that require digitising */
export const STANDARD_EXTENSIONS   = [".png", ".jpg", ".jpeg", ".pdf", ".svg", ".ai", ".eps"] as const;

export const DIGITISING_FEE        = 10.00;
export const FREE_ORDER_THRESHOLD  = 200;   // orders at or above this value get free digitising

export type DigitisingStatus =
  | "embroidery-file"   // customer uploaded DST/PES/EXP/DSB → FREE
  | "logo-on-file"      // returning customer, we already have their file → FREE
  | "free-bundle"       // bundle order → FREE (always)
  | "free-order"        // order total ≥ £200 → FREE
  | "standard-logo"     // standard image, order under £200 → £10
  | "no-logo";          // no branding → £0

export interface DigitisingResult {
  status:   DigitisingStatus;
  fee:      number;
  label:    string;   // human-readable label for basket / summary
  sublabel?: string;  // explanatory note shown under the label
  badge?:   string;   // short pill text e.g. "FREE"
}

/** Detect whether a filename is an embroidery-ready file */
export function isEmbroideryFile(filename: string): boolean {
  const ext = "." + filename.split(".").pop()?.toLowerCase();
  return (EMBROIDERY_EXTENSIONS as readonly string[]).includes(ext);
}

/** Detect whether a filename is a standard image/design file */
export function isStandardLogoFile(filename: string): boolean {
  const ext = "." + filename.split(".").pop()?.toLowerCase();
  return (STANDARD_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * Calculate the digitising status and fee for a given order.
 *
 * Priority (highest to lowest):
 *   1. No logo → no fee
 *   2. Embroidery file uploaded (.DST/.PES/.EXP/.DSB) → FREE
 *   3. Bundle order → FREE (always, regardless of value)
 *   4. Order total ≥ £200 → FREE
 *   5. Standard image uploaded + order under £200 → £10
 */
export function calculateDigitising(args: {
  hasLogo:    boolean;
  fileName?:  string;
  isBundle?:  boolean;
  orderTotal: number;   // garment + branding total, before digitising
}): DigitisingResult {
  const { hasLogo, fileName, isBundle, orderTotal } = args;

  if (!hasLogo) {
    return { status: "no-logo", fee: 0, label: "No Logo" };
  }

  if (fileName && isEmbroideryFile(fileName)) {
    return {
      status: "embroidery-file", fee: 0,
      label:    "Embroidery File Detected",
      sublabel: "No digitising required — your file is already embroidery-ready.",
      badge:    "FREE",
    };
  }

  if (isBundle) {
    return {
      status: "free-bundle", fee: 0,
      label:    "FREE Logo Digitising Included",
      sublabel: "Logo digitising is always free with Starter Bundles.",
      badge:    "FREE",
    };
  }

  if (orderTotal >= FREE_ORDER_THRESHOLD) {
    return {
      status: "free-order", fee: 0,
      label:    "FREE Logo Digitising",
      sublabel: `Included free on orders over £${FREE_ORDER_THRESHOLD}.`,
      badge:    "FREE",
    };
  }

  // Standard logo file, order under threshold → £15
  return {
    status: "standard-logo", fee: DIGITISING_FEE,
    label:    "One-Time Logo Digitising",
    sublabel: `Required to convert your logo into an embroidery-ready format. Future orders using the same logo are free.`,
    badge:    `£${DIGITISING_FEE.toFixed(2)}`,
  };
}
