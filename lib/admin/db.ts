import { prisma } from "@/lib/prisma";
import type {
  Product,
  Quote,
  Order,
  Customer,
  Lead,
  CallBooking,
  OrderItem,
  OrderCosts,
  DecorationPrice,
  PriceTier,
  QuoteStatus,
  OrderStatus,
  LeadStatus,
  CallBookingStatus,
} from "./types";

/**
 * Database access layer for the Elevate CRM.
 *
 * This used to read/write JSON files on disk. It now talks to Postgres (Supabase)
 * via Prisma, but the public function signatures are kept identical — only they
 * are now `async`. Every collection ("products" | "quotes" | "orders" |
 * "customers") maps to a Prisma model; rows are translated to/from the plain
 * domain objects defined in ./types so the rest of the app never sees Prisma's
 * row shapes (Date objects, JsonValue, etc.).
 */

type Name = "products" | "quotes" | "orders" | "customers" | "leads" | "bookings";

/* ── helpers ─────────────────────────────────────────────────────────── */

const toIso = (d: Date | string): string =>
  typeof d === "string" ? d : d.toISOString();

/** Pick the Prisma delegate for a collection name. */
function delegate(name: Name): any {
  switch (name) {
    case "products":
      return prisma.product;
    case "quotes":
      return prisma.quote;
    case "orders":
      return prisma.order;
    case "customers":
      return prisma.customer;
    case "leads":
      return prisma.lead;
    case "bookings":
      return prisma.callBooking;
  }
}

/* ── row → domain mappers ────────────────────────────────────────────── */

function mapProduct(r: any): Product {
  return {
    code: r.code,
    name: r.name,
    category: r.category,
    garmentCost: r.garmentCost,
    garmentSellPrice: r.garmentSellPrice,
    decorationCosts: (r.decorationCosts ?? {}) as Record<string, DecorationPrice>,
    decorationSellPrices: (r.decorationSellPrices ?? {}) as Record<string, DecorationPrice>,
    brandingPositions: r.brandingPositions ?? [],
    sizes: r.sizes ?? [],
    active: r.active,
    volumeTiers: (r.volumeTiers ?? []) as PriceTier[],
    updatedAt: toIso(r.updatedAt),
  };
}

function mapCustomer(r: any): Customer {
  return {
    id: r.id,
    company: r.company,
    contact: r.contact,
    email: r.email,
    phone: r.phone,
    address: r.address ?? "",
    notes: r.notes ?? "",
    digitisedLogoStatus: r.digitisedLogoStatus as Customer["digitisedLogoStatus"],
    savedLogos: r.savedLogos ?? [],
    orderIds: r.orderIds ?? [],
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
  };
}

function mapQuote(r: any): Quote {
  return {
    id: r.id,
    reference: r.reference,
    customerId: r.customerId ?? undefined,
    company: r.company,
    contact: r.contact,
    email: r.email,
    phone: r.phone,
    postcode: r.postcode ?? undefined,
    items: (r.items ?? []) as OrderItem[],
    orderNotes: r.orderNotes ?? undefined,
    subtotal: r.subtotal,
    discountPercent: r.discountPercent,
    discountAmount: r.discountAmount,
    totalRevenue: r.totalRevenue,
    totalCost: r.totalCost,
    grossProfit: r.grossProfit,
    margin: r.margin,
    status: r.status as QuoteStatus,
    orderId: r.orderId ?? undefined,
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
  };
}

function mapOrder(r: any): Order {
  return {
    id: r.id,
    reference: r.reference,
    quoteId: r.quoteId ?? undefined,
    customerId: r.customerId ?? undefined,
    company: r.company,
    contact: r.contact,
    email: r.email,
    phone: r.phone,
    address: r.address ?? undefined,
    items: (r.items ?? []) as OrderItem[],
    orderNotes: r.orderNotes ?? undefined,
    costs: (r.costs ?? {}) as OrderCosts,
    subtotal: r.subtotal,
    discountPercent: r.discountPercent,
    discountAmount: r.discountAmount,
    totalRevenue: r.totalRevenue,
    garmentCost: r.garmentCost,
    decorationCost: r.decorationCost,
    totalJobCost: r.totalJobCost,
    grossProfit: r.grossProfit,
    margin: r.margin,
    markup: r.markup,
    status: r.status as OrderStatus,
    logoFiles: r.logoFiles ?? undefined,
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
  };
}

function mapLead(r: any): Lead {
  return {
    id: r.id,
    company: r.company,
    contact: r.contact ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    address: r.address ?? "",
    source: r.source ?? "",
    notes: r.notes ?? "",
    status: r.status as LeadStatus,
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
  };
}

function mapCallBooking(r: any): CallBooking {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    business: r.business ?? "",
    date: r.date,
    time: r.time,
    notes: r.notes ?? null,
    status: r.status as CallBookingStatus,
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
  };
}

function mapRow(name: Name, row: any): any {
  switch (name) {
    case "products":
      return mapProduct(row);
    case "quotes":
      return mapQuote(row);
    case "orders":
      return mapOrder(row);
    case "customers":
      return mapCustomer(row);
    case "leads":
      return mapLead(row);
    case "bookings":
      return mapCallBooking(row);
  }
}

/** Convert a domain object/patch into Prisma write input (ISO strings → Date). */
function toWriteData<T>(item: T): any {
  const data: any = { ...(item as any) };
  if (typeof data.createdAt === "string") data.createdAt = new Date(data.createdAt);
  if (typeof data.updatedAt === "string") data.updatedAt = new Date(data.updatedAt);
  return data;
}

const isNotFound = (err: unknown): boolean =>
  !!err && typeof err === "object" && (err as { code?: string }).code === "P2025";

/* ── public API (same names as the old file-based layer, now async) ───── */

export async function readDb<T>(name: string): Promise<T[]> {
  const rows = await delegate(name as Name).findMany();
  return rows.map((r: any) => mapRow(name as Name, r)) as T[];
}

/** Bulk replace an entire collection (used for the small product catalog). */
export async function writeDb<T>(name: string, data: T[]): Promise<void> {
  const model = delegate(name as Name);
  await prisma.$transaction([
    model.deleteMany({}),
    model.createMany({ data: data.map((d) => toWriteData(d)) }),
  ]);
}

export async function findById<T extends { id: string }>(
  name: string,
  id: string
): Promise<T | undefined> {
  const row = await delegate(name as Name).findUnique({ where: { id } });
  return row ? (mapRow(name as Name, row) as T) : undefined;
}

export async function insertOne<T>(name: string, item: T): Promise<T> {
  const row = await delegate(name as Name).create({ data: toWriteData(item) });
  return mapRow(name as Name, row) as T;
}

export async function updateOne<T extends { id: string }>(
  name: string,
  id: string,
  patch: Partial<T>
): Promise<T | null> {
  try {
    const row = await delegate(name as Name).update({
      where: { id },
      data: toWriteData(patch),
    });
    return mapRow(name as Name, row) as T;
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

export async function deleteOne(name: string, id: string): Promise<boolean> {
  try {
    await delegate(name as Name).delete({ where: { id } });
    return true;
  } catch (err) {
    if (isNotFound(err)) return false;
    throw err;
  }
}

/* ── id / reference generators (unchanged, still synchronous) ─────────── */

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function generateRef(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  return `${prefix}-${ts}`;
}
