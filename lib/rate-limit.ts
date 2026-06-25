/* ============================================================
   RATE LIMITING — In-memory IP-based rate limiter
   For single-instance deployments. For multi-instance,
   replace with Redis-backed limiter (e.g., upstash/ratelimit).
   ============================================================ */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    // Window expired or new entry
    store.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
      limit: config.maxRequests,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      limit: config.maxRequests,
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
    limit: config.maxRequests,
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}

export function getClientIp(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

// Preset configurations
export const RATE_LIMITS = {
  // Strict limit for reservation creation (prevent spam)
  reservation: { windowMs: 60_000, maxRequests: 5 }, // 5 per minute
  // Moderate limit for auth endpoints (prevent brute force)
  auth: { windowMs: 900_000, maxRequests: 10 }, // 10 per 15 min
  // Lenient limit for public read APIs
  public: { windowMs: 60_000, maxRequests: 60 }, // 60 per minute
  // Very strict for reservation mutations
  mutation: { windowMs: 60_000, maxRequests: 10 }, // 10 per minute
};
