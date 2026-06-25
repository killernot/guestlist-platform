/* ============================================================
   SECURITY MIDDLEWARE — Headers + CSRF/Origin validation
   ============================================================ */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ---- Security Headers ---- */
export const SECURITY_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/* ---- Origin Validation ---- */
function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin) return true; // Same-origin request (no Origin header)

  const allowedOrigins = [
    `https://${host}`,
    "http://localhost:3000",
  ];

  return allowedOrigins.some(
    (allowed) => origin.toLowerCase() === allowed.toLowerCase()
  );
}

/* ---- Host Validation ---- */
function isValidHost(request: NextRequest): boolean {
  const host = request.headers.get("host");
  if (!host) return true;

  // Build allowlist from explicit env vars + auto-detect Vercel + localhost
  const allowedHosts = new Set<string>();

  // Local development
  allowedHosts.add("localhost:3000");
  allowedHosts.add("127.0.0.1:3000");

  // Explicit overrides
  if (process.env.ALLOWED_HOST) {
    allowedHosts.add(process.env.ALLOWED_HOST.toLowerCase());
  }
  if (process.env.VERCEL_URL) {
    allowedHosts.add(process.env.VERCEL_URL.toLowerCase());
  }

  // Derive hostname from NEXTAUTH_URL (always set on Vercel)
  if (process.env.NEXTAUTH_URL) {
    try {
      const nexthAuthHost = new URL(process.env.NEXTAUTH_URL).host;
      allowedHosts.add(nexthAuthHost.toLowerCase());
    } catch {
      // Invalid NEXTAUTH_URL — skip
    }
  }

  // Allow all Vercel app domains (preview + production auto-generated URLs)
  const normalizedHost = host.toLowerCase();
  if (normalizedHost.endsWith(".vercel.app")) {
    return true;
  }

  return allowedHosts.has(normalizedHost);
}

/* ---- Middleware ---- */
export function securityMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip security checks for Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Validate Host header (prevent host header injection)
  if (!isValidHost(request)) {
    return NextResponse.json(
      { error: "Invalid host" },
      { status: 400 }
    );
  }

  // CSRF: Validate Origin for mutation requests
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    if (!isValidOrigin(request)) {
      return NextResponse.json(
        { error: "Invalid origin" },
        { status: 403 }
      );
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}
