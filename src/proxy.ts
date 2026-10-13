// Next.js 16 proxy (formerly middleware). Edge-level gate for /admin:
// unauthenticated requests are bounced to /admin/login before any server
// component or action runs. This is defense in depth — the dashboard
// layout re-checks the session server-side, and every admin server action
// calls requireAdmin() independently. Never rely on the proxy alone.

import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "hephaestus_session";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  // Signed-in users never see the login form.
  if (pathname === "/admin/login" && hasSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Everything under /admin except the login page requires a session.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !hasSession) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
