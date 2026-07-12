import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/admin/db";

export const runtime = "nodejs";

/**
 * Public endpoint — a website visitor schedules a call.
 * Saves the booking (name, phone, chosen date + time) to the CRM database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const business = String(body.business ?? "").trim();
    const date = String(body.date ?? "").trim(); // YYYY-MM-DD
    const time = String(body.time ?? "").trim(); // HH:MM
    const notes = String(body.notes ?? "").trim() || null;

    if (!name || !phone || !business || !date || !time) {
      return NextResponse.json(
        { error: "Please enter your name, phone number, business, and pick a date and time." },
        { status: 400 }
      );
    }

    // Basic sanity checks on the chosen slot
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ error: "Invalid date or time." }, { status: 400 });
    }

    const booking = await prisma.callBooking.create({
      data: { id: generateId(), name, phone, business, date, time, notes, status: "new" },
    });

    return NextResponse.json({ success: true, id: booking.id });
  } catch (err) {
    console.error("Book-call API error:", err);
    return NextResponse.json(
      { error: "Could not save your booking. Please try again." },
      { status: 500 }
    );
  }
}
