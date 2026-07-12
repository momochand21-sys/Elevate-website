import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/admin/db";
import { sendMail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public endpoint — returns which time slots are already booked for a given date,
 * so the booking widget can grey them out before the visitor even tries to submit.
 */
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  const bookings = await prisma.callBooking.findMany({
    where: { date, status: { not: "cancelled" } },
    select: { time: true },
  });

  return NextResponse.json({ taken: bookings.map((b) => b.time) });
}

/**
 * Public endpoint — a website visitor schedules a call.
 * Saves the booking (name, phone, business, chosen date + time) to the CRM database
 * and emails the business inbox. Rejects the slot if someone else has just taken it.
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

    // Reject if someone else has already taken this exact slot
    const existing = await prisma.callBooking.findFirst({
      where: { date, time, status: { not: "cancelled" } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "That time slot has just been booked by someone else. Please pick another." },
        { status: 409 }
      );
    }

    const booking = await prisma.callBooking.create({
      data: { id: generateId(), name, phone, business, date, time, notes, status: "new" },
    });

    // Best-effort email notification — a missed email shouldn't fail the booking itself,
    // since the admin dashboard still shows it either way.
    try {
      const prettyDate = new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });
      await sendMail({
        to: "info@elevateworkwear.com",
        subject: `New Call Booking — ${name} (${business}) — ${prettyDate} at ${time}`,
        html: `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;">
<h2>New Call Booking</h2>
<table cellpadding="6" style="border-collapse:collapse;">
<tr><td><strong>Name</strong></td><td>${name}</td></tr>
<tr><td><strong>Business</strong></td><td>${business}</td></tr>
<tr><td><strong>Phone</strong></td><td>${phone}</td></tr>
<tr><td><strong>Date</strong></td><td>${prettyDate}</td></tr>
<tr><td><strong>Time</strong></td><td>${time}</td></tr>
${notes ? `<tr><td><strong>Notes</strong></td><td>${notes}</td></tr>` : ""}
</table>
</body></html>`,
        text: [
          `New Call Booking`,
          `Name: ${name}`,
          `Business: ${business}`,
          `Phone: ${phone}`,
          `Date: ${prettyDate}`,
          `Time: ${time}`,
          ...(notes ? [`Notes: ${notes}`] : []),
        ].join("\n"),
      });
    } catch (err) {
      console.error("Book-call email error:", err);
    }

    return NextResponse.json({ success: true, id: booking.id });
  } catch (err) {
    console.error("Book-call API error:", err);
    return NextResponse.json(
      { error: "Could not save your booking. Please try again." },
      { status: 500 }
    );
  }
}
