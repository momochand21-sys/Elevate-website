import { NextRequest, NextResponse } from "next/server";

const ADMIN_TOKEN = process.env.ADMIN_PASSWORD ?? "elevate2024";
const COOKIE_NAME = "elevate_admin";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  // Keep the entire CRM out of search engines.
  const noindex = (res: NextResponse) => {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return res;
  };

  // Public exceptions: the login page and the login API must stay reachable.
  if (pathname === "/admin/login") return noindex(NextResponse.next());
  if (pathname === "/api/admin/auth") return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const authed = token === ADMIN_TOKEN;

  if (authed) {
    return isAdminApi ? NextResponse.next() : noindex(NextResponse.next());
  }

  // Not authenticated: API calls get a 401; pages redirect to the login screen.
  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("from", pathname);
  return noindex(NextResponse.redirect(loginUrl));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
