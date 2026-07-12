import { NextResponse } from "next/server";
import { readDb } from "@/lib/admin/db";
import type { CallBooking } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const bookings = await readDb<CallBooking>("bookings");
  // Soonest call first
  bookings.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  return NextResponse.json(bookings);
}
