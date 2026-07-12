/* ═══════════════════════════════════════════════════════════════
   PORTAL DATA TYPES & DUMMY DATA
   Structured for future connection to Supabase / Firebase / Clerk.
   Replace dummy arrays with API calls when backend is ready.
═══════════════════════════════════════════════════════════════ */

export interface Address {
  line1:    string;
  line2?:   string;
  city:     string;
  postcode: string;
  country:  string;
}

export interface Customer {
  id:              string;
  email:           string;
  company:         string;
  contact:         string;
  phone:           string;
  jobTitle:        string;
  deliveryAddress: Address;
  billingAddress:  Address;
  createdAt:       string;
  planTier:        "standard" | "premium";
}

export interface LogoAsset {
  id:           string;
  name:         string;
  type:         "master" | "embroidery" | "print";
  fileType:     string;
  fileSize:     string;
  brandColours: string[];   // hex values
  notes:        string;
  createdAt:    string;
  approved:     boolean;
  version:      string;
}

export type OrderStatus =
  | "processing" | "artwork-review" | "in-production"
  | "shipped"    | "delivered"      | "cancelled";

/** A single garment line within a multi-item order */
export interface OrderItem {
  product:   string;
  qty:       number;
  sizes:     Record<string, number>;
  method:    string;
  positions: string[];
  logoAsset: string;
  notes?:    string;
}

export interface Order {
  id:        string;
  ref:       string;
  /** Summary fields (for table display — derived from items[0] if items present) */
  product:   string;
  qty:       number;
  sizes:     Record<string, number>;
  method:    string;
  positions: string[];
  logoAsset: string;
  date:      string;
  status:    OrderStatus;
  total:     number;
  tracking?: string;
  /** All garments in this order — use for reorder */
  items:     OrderItem[];
  company?:  string;
  notes?:    string;
}

export type QuoteStatus =
  | "pending" | "approved" | "rejected"
  | "awaiting-artwork" | "completed";

export interface Quote {
  id:        string;
  ref:       string;
  product:   string;
  qty:       number;
  method:    string;
  positions: string[];
  total:     number;
  status:    QuoteStatus;
  date:      string;
  notes?:    string;
}

export interface Preset {
  id:        string;
  name:      string;
  icon:      string;
  product:   string;
  sizes:     Record<string, number>;
  qty:       number;
  method:    string;
  positions: string[];
  logoAsset: string;
  notes:     string;
  lastUsed:  string;
}

/* ─── Demo credentials are checked server-side only via /api/portal/auth ─── */
/* Do NOT add credentials here — they live in .env.local only */

/* ─── Dummy customer ─── */
export const DUMMY_CUSTOMER: Customer = {
  id:       "cust_001",
  email:    "ops@autofix-carwash.co.uk",
  company:  "AutoFix Car Wash Ltd",
  contact:  "Mohammed Pae",
  phone:    "+44 7534 675 533",
  jobTitle: "Operations Director",
  deliveryAddress: {
    line1:    "Unit 12, Trafford Park",
    city:     "Manchester",
    postcode: "M17 1PA",
    country:  "United Kingdom",
  },
  billingAddress: {
    line1:    "AutoFix Car Wash Ltd, 45 Deansgate",
    city:     "Manchester",
    postcode: "M3 2AY",
    country:  "United Kingdom",
  },
  createdAt: "2024-11-01",
  planTier:  "premium",
};

/* ─── Dummy logo assets ─── */
export const DUMMY_LOGOS: LogoAsset[] = [
  {
    id:           "logo_001",
    name:         "AutoFix Primary Logo",
    type:         "master",
    fileType:     "SVG",
    fileSize:     "48 KB",
    brandColours: ["#0041F9", "#FFFFFF", "#050505"],
    notes:        "Main brand logo. Use on all front-left chest positions.",
    createdAt:    "2024-11-05",
    approved:     true,
    version:      "v2.1",
  },
  {
    id:           "logo_002",
    name:         "AutoFix Embroidery File",
    type:         "embroidery",
    fileType:     "DST",
    fileSize:     "112 KB",
    brandColours: ["#0041F9", "#FFFFFF"],
    notes:        "Digitised for 3,500 stitch count. Max 80mm width.",
    createdAt:    "2024-11-12",
    approved:     true,
    version:      "v1.0",
  },
  {
    id:           "logo_003",
    name:         "AutoFix Print File (Back)",
    type:         "print",
    fileType:     "PDF",
    fileSize:     "2.4 MB",
    brandColours: ["#0041F9", "#FFFFFF"],
    notes:        "300dpi, CMYK. Full back print version. Max A4 size.",
    createdAt:    "2024-12-02",
    approved:     true,
    version:      "v1.2",
  },
];

/* ─── Dummy orders ─── */
export const DUMMY_ORDERS: Order[] = [

  /* ── Order 1: All Clean Express — Polo + Hoodie team kit ── */
  {
    id: "ord_001", ref: "ELV-AC001", company: "All Clean Express",
    product: "10× Polo + 10× Hoodie", qty: 20,
    sizes: { M: 8, L: 8, XL: 4 },
    method: "Embroidery", positions: ["Front Chest", "Back"],
    logoAsset: "AllClean-Embroidery.dst",
    date: "2026-03-12", status: "delivered", total: 429.80,
    tracking: "RM4421839012GB",
    items: [
      {
        product: "Premium Workwear Polo", qty: 10,
        sizes: { M: 4, L: 4, XL: 2 },
        method: "Embroidery", positions: ["Front Chest", "Back"],
        logoAsset: "AllClean-Embroidery.dst",
      },
      {
        product: "Premium Workwear Hoodie", qty: 10,
        sizes: { M: 4, L: 4, XL: 2 },
        method: "Embroidery", positions: ["Front Chest", "Back"],
        logoAsset: "AllClean-Embroidery.dst",
      },
    ],
  },

  /* ── Order 2: Premier Cleaning — Polo + Hoodie + Gilet ── */
  {
    id: "ord_002", ref: "ELV-PC002", company: "Premier Cleaning",
    product: "5× Polo + 3× Hoodie + 1× Gilet", qty: 9,
    sizes: { M: 3, L: 4, XL: 2 },
    method: "Embroidery", positions: ["Left Chest"],
    logoAsset: "PremierCleaning-Logo.png",
    date: "2026-04-05", status: "in-production", total: 221.82,
    items: [
      {
        product: "Premium Workwear Polo", qty: 5,
        sizes: { M: 2, L: 2, XL: 1 },
        method: "Embroidery", positions: ["Left Chest"],
        logoAsset: "PremierCleaning-Logo.png",
      },
      {
        product: "Premium Workwear Hoodie", qty: 3,
        sizes: { M: 1, L: 1, XL: 1 },
        method: "Embroidery", positions: ["Left Chest"],
        logoAsset: "PremierCleaning-Logo.png",
      },
      {
        product: "Premium Workwear Gilet", qty: 1,
        sizes: { L: 1 },
        method: "Embroidery", positions: ["Left Chest"],
        logoAsset: "PremierCleaning-Logo.png",
      },
    ],
  },

  /* ── Order 3: Trade Electrical — Full uniform pack ── */
  {
    id: "ord_003", ref: "ELV-TE003", company: "Trade Electrical",
    product: "10× Polo + 10× Hoodie + 2× Gilet + 2× ¼Zip + 10× Cap", qty: 34,
    sizes: { M: 10, L: 10, XL: 8, XXL: 6 },
    method: "Embroidery", positions: ["Front Chest", "Back"],
    logoAsset: "TradeElectrical-Embroidery.dst",
    date: "2026-04-18", status: "shipped", total: 897.40,
    tracking: "RM8812730049GB",
    items: [
      {
        product: "Premium Workwear Polo", qty: 10,
        sizes: { M: 4, L: 3, XL: 2, XXL: 1 },
        method: "Embroidery", positions: ["Front Chest", "Back"],
        logoAsset: "TradeElectrical-Embroidery.dst",
      },
      {
        product: "Premium Workwear Hoodie", qty: 10,
        sizes: { M: 4, L: 3, XL: 2, XXL: 1 },
        method: "Embroidery", positions: ["Front Chest", "Back"],
        logoAsset: "TradeElectrical-Embroidery.dst",
      },
      {
        product: "Premium Workwear Gilet", qty: 2,
        sizes: { L: 1, XL: 1 },
        method: "Embroidery", positions: ["Left Chest"],
        logoAsset: "TradeElectrical-Embroidery.dst",
      },
      {
        product: "Premium Workwear 1/4 Zip", qty: 2,
        sizes: { M: 1, L: 1 },
        method: "Embroidery", positions: ["Left Chest"],
        logoAsset: "TradeElectrical-Embroidery.dst",
      },
      {
        product: "Premium Workwear Cap", qty: 10,
        sizes: { "One Size": 10 },
        method: "Embroidery", positions: ["Front Chest"],
        logoAsset: "TradeElectrical-Embroidery.dst",
      },
    ],
  },

  /* ── Order 4: Bright Facilities — Large polo run ── */
  {
    id: "ord_004", ref: "ELV-BF004", company: "Bright Facilities",
    product: "15× Polo + 5× Hoodie", qty: 20,
    sizes: { M: 7, L: 7, XL: 4, XXL: 2 },
    method: "Embroidery", positions: ["Left Chest"],
    logoAsset: "BrightFacilities-Logo.png",
    date: "2026-05-01", status: "artwork-review", total: 323.80,
    items: [
      {
        product: "Premium Workwear Polo", qty: 15,
        sizes: { M: 5, L: 5, XL: 3, XXL: 2 },
        method: "Embroidery", positions: ["Left Chest"],
        logoAsset: "BrightFacilities-Logo.png",
      },
      {
        product: "Premium Workwear Hoodie", qty: 5,
        sizes: { M: 2, L: 2, XL: 1 },
        method: "Embroidery", positions: ["Left Chest"],
        logoAsset: "BrightFacilities-Logo.png",
      },
    ],
  },

  /* ── Order 5: Metro Security — Large full-team kit ── */
  {
    id: "ord_005", ref: "ELV-MS005", company: "Metro Security",
    product: "20× Polo + 20× Hoodie + 10× Gilet + 10× Beanie", qty: 60,
    sizes: { M: 18, L: 20, XL: 14, XXL: 8 },
    method: "Embroidery", positions: ["Left Chest", "Back"],
    logoAsset: "MetroSecurity-Embroidery.dst",
    date: "2026-05-15", status: "processing", total: 1348.60,
    notes: "Security supervisor pack — back logo must use navy thread.",
    items: [
      {
        product: "Premium Workwear Polo", qty: 20,
        sizes: { M: 8, L: 7, XL: 3, XXL: 2 },
        method: "Embroidery", positions: ["Left Chest", "Back"],
        logoAsset: "MetroSecurity-Embroidery.dst",
      },
      {
        product: "Premium Workwear Hoodie", qty: 20,
        sizes: { M: 8, L: 7, XL: 3, XXL: 2 },
        method: "Embroidery", positions: ["Left Chest", "Back"],
        logoAsset: "MetroSecurity-Embroidery.dst",
      },
      {
        product: "Premium Workwear Gilet", qty: 10,
        sizes: { M: 2, L: 4, XL: 3, XXL: 1 },
        method: "Embroidery", positions: ["Left Chest"],
        logoAsset: "MetroSecurity-Embroidery.dst",
      },
      {
        product: "Premium Workwear Beanie", qty: 10,
        sizes: { "One Size": 10 },
        method: "Embroidery", positions: ["Front Chest"],
        logoAsset: "MetroSecurity-Embroidery.dst",
        notes: "Navy thread to match jacket colour.",
      },
    ],
  },
];

/* ─── Dummy quotes ─── */
export const DUMMY_QUOTES: Quote[] = [
  {
    id:        "quot_001",
    ref:       "ELV-Q2T8N",
    product:   "Premium Workwear Hoodie",
    qty:       100,
    method:    "Embroidery",
    positions: ["Left Chest", "Back"],
    total:     2249.00,
    status:    "pending",
    date:      "2025-05-28",
    notes:     "Seasonal uniform order for summer staff intake.",
  },
  {
    id:        "quot_002",
    ref:       "ELV-Q5X1L",
    product:   "Premium Workwear Hoodie",
    qty:       24,
    method:    "Print",
    positions: ["Front Centre"],
    total:     687.84,
    status:    "approved",
    date:      "2025-04-02",
  },
  {
    id:        "quot_003",
    ref:       "ELV-Q9K4V",
    product:   "Premium Workwear Hoodie",
    qty:       12,
    method:    "Embroidery",
    positions: ["Left Chest"],
    total:     359.88,
    status:    "completed",
    date:      "2025-01-15",
  },
];

/* ─── Dummy presets ─── */
export const DUMMY_PRESETS: Preset[] = [
  {
    id:        "pre_001",
    name:      "Staff Hoodie — Standard",
    icon:      "👕",
    product:   "Premium Workwear Hoodie",
    sizes:     { S: 4, M: 8, L: 8, XL: 4 },
    qty:       24,
    method:    "Embroidery",
    positions: ["Left Chest"],
    logoAsset: "AutoFix Embroidery File",
    notes:     "Standard staff issue. Reorder quarterly.",
    lastUsed:  "2025-04-08",
  },
  {
    id:        "pre_002",
    name:      "Supervisor Pack — Full Brand",
    icon:      "⭐",
    product:   "Premium Workwear Hoodie",
    sizes:     { M: 5, L: 5, XL: 2 },
    qty:       12,
    method:    "Embroidery + Print",
    positions: ["Left Chest", "Back"],
    logoAsset: "AutoFix Print File (Back)",
    notes:     "Full branding for supervisors. Chest logo + back print.",
    lastUsed:  "2025-02-14",
  },
];

/* ─── Status colour map ─── */
export const ORDER_STATUS_COLOUR: Record<OrderStatus, string> = {
  "processing":     "#60a5fa",
  "artwork-review": "#fbbf24",
  "in-production":  "#a78bfa",
  "shipped":        "#34d399",
  "delivered":      "#22c55e",
  "cancelled":      "#f87171",
};

export const QUOTE_STATUS_COLOUR: Record<QuoteStatus, string> = {
  "pending":          "#fbbf24",
  "approved":         "#22c55e",
  "rejected":         "#f87171",
  "awaiting-artwork": "#a78bfa",
  "completed":        "#60a5fa",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  "processing":     "Processing",
  "artwork-review": "Artwork Review",
  "in-production":  "In Production",
  "shipped":        "Shipped",
  "delivered":      "Delivered",
  "cancelled":      "Cancelled",
};

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  "pending":          "Pending",
  "approved":         "Approved",
  "rejected":         "Rejected",
  "awaiting-artwork": "Awaiting Artwork",
  "completed":        "Completed",
};
