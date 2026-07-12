/**
 * Seed the Postgres database from the existing data/*.json files.
 *
 * Idempotent: uses upsert keyed on each record's primary key, so running it
 * multiple times will not create duplicates — it just refreshes the rows.
 *
 *   npm run db:seed        (loads .env.local, then `prisma db seed`)
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T = Record<string, unknown>>(name: string): T[] {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, `${name}.json`), "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Convert ISO date strings into Date objects for Prisma. */
function withDates<T extends Record<string, any>>(item: T): T {
  const data: any = { ...item };
  if (typeof data.createdAt === "string") data.createdAt = new Date(data.createdAt);
  if (typeof data.updatedAt === "string") data.updatedAt = new Date(data.updatedAt);
  return data;
}

async function main() {
  const products = readJson("products");
  const customers = readJson("customers");
  const quotes = readJson("quotes");
  const orders = readJson("orders");

  for (const p of products) {
    const data = withDates(p) as any;
    await prisma.product.upsert({ where: { code: data.code }, create: data, update: data });
  }

  for (const c of customers) {
    const data = withDates(c) as any;
    await prisma.customer.upsert({ where: { id: data.id }, create: data, update: data });
  }

  for (const q of quotes) {
    const data = withDates(q) as any;
    await prisma.quote.upsert({ where: { id: data.id }, create: data, update: data });
  }

  for (const o of orders) {
    const data = withDates(o) as any;
    await prisma.order.upsert({ where: { id: data.id }, create: data, update: data });
  }

  console.log(
    `Seeded → ${products.length} products, ${customers.length} customers, ${quotes.length} quotes, ${orders.length} orders`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
