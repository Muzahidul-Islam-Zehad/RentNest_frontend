import { NextRequest, NextResponse } from "next/server";

/**
 * Edge route protection.
 * - Session presence is flagged by the `rn_session` cookie, set on login and
 *   cleared on logout (see auth-store). Fine-grained role checks happen in
 *   RoleGuard + every dashboard page, because the JWT itself is an httpOnly
 *   cookie owned by the backend domain.
 * - Deep role enforcement additionally happens server-side on the backend API
 *   (401/403), which the UI surfaces via toasts + auto-logout.
 */

const PROTECTED_PREFIXES = ["/dashboard", "/profile"];
const AUTH_PAGES = ["/auth/login", "/auth/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get("rn_session")?.value);

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
