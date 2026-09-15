import { NextRequest, NextResponse } from "next/server";

/**
 * Session cookie sync (first-party).
 *
 * The backend cannot be modified, and its CORS config (wildcard origin) is
 * incompatible with credentialed cross-origin requests — so the browser never
 * receives the backend's httpOnly cookie. Instead:
 *   1. login returns the JWT in the JSON body (stored in the zustand store)
 *   2. the client POSTs it here, and we store it in OUR OWN httpOnly cookie
 *   3. the catch-all proxy (/api/[...path]) forwards it to the backend as the
 *      `accessToken` cookie its auth middleware expects
 *
 * Cookie lifetime matches the backend's JWT_ACCESS_TOKEN_EXPIRES_IN (1 day).
 */

const COOKIE_NAME = "rn_access_token";
const MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { accessToken?: string } | null;
  const accessToken = body?.accessToken;

  if (!accessToken || typeof accessToken !== "string") {
    return NextResponse.json(
      { success: false, message: "Missing accessToken" },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ success: true, message: "Session stored" });
  res.cookies.set(COOKIE_NAME, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: "Session cleared" });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
