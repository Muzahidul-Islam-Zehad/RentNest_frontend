import { NextRequest, NextResponse } from "next/server";

/**
 * Edge route protection.
 *
 * The JWT lives in the first-party httpOnly `rn_access_token` cookie (set by
 * /api/auth/session), so the middleware checks that cookie directly — a single
 * source of truth. Fine-grained role checks happen in RoleGuard + every
 * dashboard page; the backend enforces roles again server-side (401/403).
 */

const PROTECTED_PREFIXES = ["/dashboard", "/profile"];
const AUTH_PAGES = ["/auth/login", "/auth/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Cookie lifetime (1 day) matches the backend JWT expiry, so presence here
  // tracks a valid session. Empty on logout (session route clears it).
  const hasSession = Boolean(req.cookies.get("rn_access_token")?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Unauthenticated user → bounce to login, remembering where they wanted to go
  if (isProtected && !hasSession) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → skip auth pages
  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile", "/auth/login", "/auth/register"],
};
