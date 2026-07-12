export type BrandingMethod = "embroidery" | "print" | "both";

export interface PriceTier {
  min: number;
  max: number;
  price: number;
}

export interface DecorationPrice {
  embroidery: number;
  print: number;
}

export interface Product {
  code: string;
  name: string;
  category: string;
  garmentCost: number;
  garmentSellPrice: number;
  decorationCosts: Record<string, DecorationPrice>;
  decorationSellPrices: Record<string, DecorationPrice>;
  brandingPositions: string[];
  sizes: string[];
  active: boolean;
  volumeTiers: PriceTier[];
  updatedAt: string;
}

export type QuoteStatus = "new" | "sent" | "approved" | "rejected" | "converted";

export type LeadStatus = "new" | "contacted" | "interested" | "not_interested" | "converted";

export interface Lead {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  source: string;
  notes: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "payment_pending"
  | "paid"
  | "sent_to_supplier"
  | "in_production"
  | "quality_check"
  | "dispatched"
  | "completed";

export interface OrderItem {
  productCode: string;
  productName: string;
  qty: number;
  sizeQtys?: Record<string, number>;
  method: BrandingMethod;
  positions: string[];
  basePerUnit: number;
  brandingPerUnit: number;
  totalPerUnit: number;
  lineTotal: number;
  garmentCostPerUnit?: number;
  decorationCostPerUnit?: number;
}

export interface Customer {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  digitisedLogoStatus: "none" | "pending" | "complete";
  savedLogos: string[];
  orderIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  reference: string;
  customerId?: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  postcode?: string;
  items: OrderItem[];
  orderNotes?: string;
  /** Sum of all line totals before any discount is applied */
  subtotal: number;
  /** Whole-quote discount, e.g. 20 means 20% off the subtotal */
  discountPercent: number;
  /** Calculated £ value of the discount (subtotal × discountPercent / 100) */
  discountAmount: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  margin: number;
  status: QuoteStatus;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCosts {
  digitisingCost: number;
  packagingCost: number;
  paymentFee: number;
  shippingCost: number;
}

export interface Order {
  id: string;
  reference: string;
  quoteId?: string;
  customerId?: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  address?: string;
  items: OrderItem[];
  orderNotes?: string;
  costs: OrderCosts;
  /** Sum of all line totals before any discount is applied */
  subtotal: number;
  /** Whole-order discount carried over from the quote (or set directly), e.g. 20 = 20% off */
  discountPercent: number;
  /** Calculated £ value of the discount (subtotal × discountPercent / 100) */
  discountAmount: number;
  totalRevenue: number;
  garmentCost: number;
  decorationCost: number;
  totalJobCost: number;
  grossProfit: number;
  margin: number;
  markup: number;
  status: OrderStatus;
  logoFiles?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalQuotes: number;
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  avgMargin: number;
  pendingQuotes: number;
  ordersInProduction: number;
  completedOrders: number;
  thisMonthRevenue: number;
  thisMonthProfit: number;
  avgOrderValue: number;
  bestCustomer: string;
  bestCustomerRevenue: number;
  topProduct: string;
  topProductQty: number;
}
