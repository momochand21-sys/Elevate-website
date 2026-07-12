/* ───────────────────────────────────────────────────────────────────
   BUNDLE DEALS — Elevate Workwear Solutions

   Each bundle is priced BELOW the "bought separately" price (to entice
   the customer) while staying comfortably ABOVE the combined cost price
   (so every bundle remains profitable).

   Garment cost / retail reference:
     Hoodie    (ELV-001)  cost £18.60  retail £25.99
     Polo      (ELV-002)  cost £9.12   retail £12.99
     Beanie    (ELV-003)  cost £4.83   retail £6.99
     Cap       (ELV-004)  cost £5.21   retail £7.99
     Gilet     (ELV-005)  cost £20.43  retail £26.99
     1/4 Zip   (ELV-006)  cost £18.00  retail £24.99
─────────────────────────────────────────────────────────────────── */

export type ProductKey =
  | "hoodie" | "polo" | "beanie" | "cap" | "gilet" | "quarterzip";

export interface BundleLine {
  key:      ProductKey;
  name:     string;
  code:     string;
  qty:      number;
  /** true → multi-size garment (XS–XXL grid); false → single-size headwear */
  sized:    boolean;
  sizes?:   readonly string[];
  retail:   number;   // per-unit retail
  cost:     number;   // per-unit cost
}

/** Branding included for free as part of the bundle price */
export interface IncludedBranding {
  method:   "embroidery" | "print";
  position: string;          // default free position e.g. "Left Chest"
  positionOptions?: string[]; // if set, customer picks one of these — all free
  label:    string;          // e.g. "Free Embroidered Logo On Every Item"
}

/** Optional extra branding placement the customer can pay to add */
export interface AddonPlacement {
  position: string;
  price:    number;       // per-unit, per-placement
}

/** A customer choice that swaps one garment into the bundle (e.g. outer layer) */
export interface BundleChoiceOption {
  key:    ProductKey;
  label:  string;         // "Premium Gilet"
  image:  string;         // bundle composite image for this choice
  thumb:  string;         // single-garment thumbnail for the selector
}
export interface BundleChoice {
  label:   string;        // "Choose Your Outer Layer"
  qty:     number;        // how many of the chosen garment are added
  options: BundleChoiceOption[];
}

export interface Bundle {
  slug:        string;
  name:        string;
  code:        string;
  tagline:     string;
  description: string;
  image:       string;    // default / fallback image
  perfectFor?: string[];
  lines:       BundleLine[];   // fixed garments (not incl. the choice)
  choice?:     BundleChoice;   // optional swappable garment
  retailTotal: number;    // "bought separately" comparison price
  costTotal:   number;    // combined cost price (uses first choice option)
  bundlePrice: number;    // what the customer pays
  saving:      number;
  savingPct:   number;
  profit:      number;
  includedBranding?: IncludedBranding;
  includedBrandingRetail?: number; // per-unit retail value of the free branding
  addonMethod?:      "embroidery" | "print";
  addonPlacements?:  AddonPlacement[];
}

const SIZES_6 = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const PRODUCTS: Record<ProductKey, Omit<BundleLine, "qty">> = {
  hoodie:     { key: "hoodie",     name: "Premium Workwear Hoodie",  code: "ELV-001", sized: true,  sizes: SIZES_6, retail: 25.99, cost: 18.60 },
  polo:       { key: "polo",       name: "Premium Workwear Polo",    code: "ELV-002", sized: true,  sizes: SIZES_6, retail: 12.99, cost: 9.12  },
  beanie:     { key: "beanie",     name: "Premium Workwear Beanie",  code: "ELV-003", sized: false,                 retail: 6.99,  cost: 4.83  },
  cap:        { key: "cap",        name: "Premium Workwear Cap",     code: "ELV-004", sized: false,                 retail: 7.99,  cost: 5.21  },
  gilet:      { key: "gilet",      name: "Premium Workwear Gilet",   code: "ELV-005", sized: true,  sizes: SIZES_6, retail: 26.99, cost: 20.43 },
  quarterzip: { key: "quarterzip", name: "Premium Workwear 1/4 Zip", code: "ELV-006", sized: true,  sizes: SIZES_6, retail: 24.99, cost: 18.00 },
};

function line(key: ProductKey, qty: number): BundleLine {
  return { ...PRODUCTS[key], qty };
}

function build(args: {
  slug: string; name: string; code: string; tagline: string;
  description: string; image: string; perfectFor?: string[];
  lines: BundleLine[]; choice?: BundleChoice; bundlePrice: number;
  retailTotal?: number;
  includedBranding?: IncludedBranding;
  includedBrandingRetail?: number;
  addonMethod?: "embroidery" | "print";
  addonPlacements?: AddonPlacement[];
}): Bundle {
  const fixedUnits   = args.lines.reduce((s, l) => s + l.qty, 0);
  const choiceUnits  = args.choice ? args.choice.qty : 0;
  const totalUnits   = fixedUnits + choiceUnits;

  const fixedRetail  = args.lines.reduce((s, l) => s + l.retail * l.qty, 0);
  const choiceRetail = args.choice ? PRODUCTS[args.choice.options[0].key].retail * args.choice.qty : 0;
  /* Value of the included free branding at its retail rate */
  const brandingRetail = args.includedBranding ? (args.includedBrandingRetail ?? 0) * totalUnits : 0;
  const retailTotal  = args.retailTotal ?? fixedRetail + choiceRetail + brandingRetail;

  const fixedCost    = args.lines.reduce((s, l) => s + l.cost * l.qty, 0);
  const choiceCost   = args.choice ? PRODUCTS[args.choice.options[0].key].cost * args.choice.qty : 0;
  const costTotal    = fixedCost + choiceCost;
  const saving       = +(retailTotal - args.bundlePrice).toFixed(2);
  const savingPct    = Math.round((saving / retailTotal) * 100);
  const profit       = +(args.bundlePrice - costTotal).toFixed(2);
  return {
    ...args,
    retailTotal: +retailTotal.toFixed(2),
    costTotal:   +costTotal.toFixed(2),
    saving, savingPct, profit,
  };
}

export const BUNDLES: Bundle[] = [
  build({
    slug: "new-business-starter-pack",
    name: "New Business Starter Pack",
    code: "BDL-001",
    tagline: "5× Polo + 5× Hoodie + Outer Layer",
    description: "Everything a small business needs to outfit a new team. Five smart polos and five heavyweight hoodies, plus your choice of a padded gilet or a cotton 1/4 zip. A free embroidered logo is included on every item — a complete branded workwear solution, ready to wear.",
    image: "/products/bundles/bundle-business-starter-all.png",
    perfectFor: [
      "Trades", "Car Washes", "Cleaning Companies",
      "Landscapers", "Small Businesses", "Teams of 3–5 Staff",
    ],
    lines: [ line("polo", 5), line("hoodie", 5) ],
    choice: {
      label: "Choose Your Outer Layer",
      qty: 1,
      options: [
        { key: "gilet",      label: "Premium Gilet",   image: "/products/bundles/bundle-business-starter-gilet.png",      thumb: "/products/gilet-360/gilet-front-final-v3.png" },
        { key: "quarterzip", label: "Premium 1/4 Zip", image: "/products/bundles/bundle-business-starter-quarterzip.png", thumb: "/products/quarter-zip-360/quarter-zip-000.png" },
      ],
    },
    bundlePrice: 225.00,
    includedBrandingRetail: 3.50,
    includedBranding: {
      method: "embroidery",
      position: "Left Chest",
      positionOptions: ["Left Chest", "Right Chest", "Front Centre"],
      label: "Free Embroidered Logo On Every Item",
    },
    addonMethod: "embroidery",
    addonPlacements: [
      { position: "Back",           price: 5.00 },
      { position: "Left Shoulder",  price: 1.50 },
      { position: "Right Shoulder", price: 1.50 },
    ],
  }),
];

export function getBundle(slug: string): Bundle | undefined {
  return BUNDLES.find(b => b.slug === slug);
}

/** The single featured bundle promoted across the site. */
export const FEATURED_BUNDLE = BUNDLES[0];
