import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ADMIN_TOKEN = process.env.ADMIN_PASSWORD ?? "elevate2024";
const COOKIE_NAME = "elevate_admin";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== ADMIN_TOKEN) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, ADMIN_TOKEN, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
