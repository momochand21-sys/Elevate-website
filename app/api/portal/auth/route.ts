import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    /* Credentials live only in .env.local — never in the client bundle */
    const validEmail    = process.env.PORTAL_DEMO_EMAIL;
    const validPassword = process.env.PORTAL_DEMO_PASSWORD;

    if (!validEmail || !validPassword) {
      console.error("[portal/auth] PORTAL_DEMO_EMAIL or PORTAL_DEMO_PASSWORD not set in .env.local");
      return NextResponse.json({ error: "Auth not configured." }, { status: 500 });
    }

    /* Case-insensitive email comparison */
    const emailMatch    = email.trim().toLowerCase() === validEmail.toLowerCase();
    const passwordMatch = password === validPassword;

    if (!emailMatch || !passwordMatch) {
      /* Uniform delay prevents timing-based enumeration */
      await new Promise(r => setTimeout(r, 400));
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    /* Success — return a session token (in production: use JWT / signed cookie) */
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
