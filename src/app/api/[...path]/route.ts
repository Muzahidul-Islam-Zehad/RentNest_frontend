import { NextRequest, NextResponse } from "next/server";

/**
 * Same-origin API proxy to the RentNest backend.
 *
 * Why this exists: the backend answers with `Access-Control-Allow-Origin: *`
 * (default `cors()` config) while the frontend needs credentialed requests for
 * its httpOnly JWT cookie. Browsers forbid the wildcard + credentials combo, so
 * every cross-origin call fails. Routing all API traffic through this proxy
 * keeps the browser same-origin (no CORS at all) while the server-to-server
 * forward below has no CORS restrictions.
 *
 * The backend's auth middleware reads `req.cookies.accessToken`, so the JWT
 * stored in our own httpOnly cookie (/api/auth/session) is forwarded as that
 * cookie on every proxied request.
 */

const BACKEND_URL = process.env.API_PROXY_TARGET ?? "https://rent-nest-navy.vercel.app";
const ACCESS_TOKEN_COOKIE = "rn_access_token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  const incoming = new URL(req.url);
  const targetUrl = `${BACKEND_URL}/api/${path.join("/")}${incoming.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", "application/json");

  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken) {
    headers.set("cookie", `accessToken=${encodeURIComponent(accessToken)}`);
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.arrayBuffer() : undefined;

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Cannot reach the RentNest API. Please try again." },
      { status: 502 }
    );
  }

  const headersOut = new Headers();
  const resContentType = backendRes.headers.get("content-type");
  if (resContentType) headersOut.set("content-type", resContentType);
  headersOut.set("cache-control", "no-store");

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: headersOut,
  });
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  return forward(req, ctx);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  return forward(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return forward(req, ctx);
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  return forward(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return forward(req, ctx);
}
