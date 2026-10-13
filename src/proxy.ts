// Next.js 16 proxy (formerly middleware). Two jobs:
//
// 1. Edge-level gate for /admin: unauthenticated requests are bounced to
//    /admin/login before any server component or action runs. This is
//    defense in depth — the dashboard layout re-checks the session
//    server-side, and every admin server action calls requireAdmin()
//    independently. Never rely on the proxy alone.
// 2. Existence check for public detail routes. Detail pages under Cache
//    Components always render with a static shell, so a missing/unpublished
//    slug would otherwise soft-404 with HTTP 200. The proxy runs a cheap
//    indexed slug+status lookup and returns a real HTTP 404 for misses.
//    The page's notFound() check remains as a fallback (e.g. if the DB is
//    briefly unavailable during the proxy check).

import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { entries } from "@/db/schema";

const SESSION_COOKIE_NAME = "hephaestus_session";

// Only single-segment paths are public detail routes. Normalization mirrors
// the canonical redirect on the page (lowercase, spaces to hyphens) so a
// misspelled-cased URL 404s with the right status instead of redirecting.
const DETAIL_PATTERN = /^\/(?:directory|learn)\/([^/]+)\/?$/;

function normalizeSlug(value: string): string {
  return decodeURIComponent(value).toLowerCase().replace(/\s+/g, "-");
}

// Minimal branded body for hard 404s. In-app client navigations still render
// the styled not-found boundary; this covers direct visits and crawlers.
function notFoundResponse(): NextResponse {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>404 | Hephaestus&#39; Automaton</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0d0d0f;color:#ece5da;
  font:16px/1.6 system-ui,-apple-system,sans-serif;text-align:center;padding:24px}
  h1{font-size:3rem;margin:0;color:#ff6a1a}
  a{color:#ece5da}
</style>
</head>
<body>
<div>
  <h1>404</h1>
  <p>This page could not be found.</p>
  <p><a href="/">Return to Hephaestus&#39; Automaton</a></p>
</div>
</body>
</html>`,
    {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    }
  );
}

export default async function proxy(request: NextRequest) {
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

  // Public detail routes: 404 immediately for unknown/unpublished slugs.
  const detailMatch = pathname.match(DETAIL_PATTERN);
  if (detailMatch) {
    let slug: string;
    try {
      slug = normalizeSlug(detailMatch[1]);
    } catch {
      // Malformed percent-encoding is never a valid slug.
      return notFoundResponse();
    }
    try {
      const found = await db
        .select({ id: entries.id })
        .from(entries)
        .where(and(eq(entries.slug, slug), eq(entries.status, "published")))
        .limit(1);
      if (!found.length) {
        return notFoundResponse();
      }
    } catch (err) {
      // DB unavailable: fall through and let the page render its own error
      // state instead of failing every request at the edge.
      console.error("Proxy slug check failed", err);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/directory/:path*", "/learn/:path*"],
};
