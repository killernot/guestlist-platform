import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { securityMiddleware, SECURITY_HEADERS } from "./lib/security";
import {
  checkRateLimit,
  getRateLimitHeaders,
  getClientIp,
  RATE_LIMITS,
} from "./lib/rate-limit";

// Routes that require authentication
const protectedRoutes = ["/admin", "/checkin"];

// API routes that require authentication (return 401 instead of redirect)
const protectedApiRoutes = ["/api/reservations"];

// Public routes that should never be blocked
const publicRoutes = [
  "/admin/login",
  "/api/register",
  "/api/auth",
  "/api/events",
  "/api/stats",
  "/",
  "/events",
  "/reservation-success",
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === "/") return pathname === "/";
    if (route.endsWith("/*")) {
      const prefix = route.slice(0, -1);
      return pathname.startsWith(prefix);
    }
    return pathname.startsWith(route);
  });
}

function isProtectedApiRoute(pathname: string): boolean {
  return protectedApiRoutes.some((route) => pathname.startsWith(route));
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Apply security middleware (headers + CSRF)
  const securityResponse = securityMiddleware(request);
  if (securityResponse.status !== 200) {
    return securityResponse;
  }

  // Rate limiting based on route type
  const ip = getClientIp(request);
  let rateLimitResult;

  if (pathname.startsWith("/api/register")) {
    rateLimitResult = checkRateLimit(
      `ratelimit:register:${ip}`,
      RATE_LIMITS.reservation
    );
  } else if (pathname.startsWith("/api/reservations")) {
    rateLimitResult = checkRateLimit(
      `ratelimit:mutation:${ip}`,
      RATE_LIMITS.mutation
    );
  } else if (
    pathname.startsWith("/api/auth") ||
    pathname === "/admin/login"
  ) {
    rateLimitResult = checkRateLimit(`ratelimit:auth:${ip}`, RATE_LIMITS.auth);
  } else if (pathname.startsWith("/api/")) {
    rateLimitResult = checkRateLimit(
      `ratelimit:public:${ip}`,
      RATE_LIMITS.public
    );
  }

  // If rate limited, return 429
  if (rateLimitResult && !rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  }

  // Skip public routes (but add security + rate limit headers)
  if (isPublicRoute(pathname)) {
    const response = securityResponse;
    if (rateLimitResult) {
      Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(([k, v]) =>
        response.headers.set(k, v)
      );
    }
    return response;
  }

  // Validate JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If token exists, allow the request
  if (token) {
    const response = NextResponse.next();
    if (rateLimitResult) {
      Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(([k, v]) =>
        response.headers.set(k, v)
      );
    }
    return response;
  }

  // Protected API routes return 401 JSON
  if (isProtectedApiRoute(pathname)) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 }
    );
  }

  // Protected page routes redirect to login
  if (isProtectedRoute(pathname)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For any other route, allow through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
