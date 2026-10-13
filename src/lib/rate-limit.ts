// In-memory sliding-window rate limiter for sensitive endpoints.
//
// Caveat: on serverless (Vercel) this is per-instance and resets on cold
// starts, so it is a best-effort throttle only. For hardened production
// limits, front the app with Vercel WAF / external rate limiting. The
// database-backed check below is deliberately separate from this throttle.

const buckets = new Map<string, number[]>();

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

/**
 * Records an attempt for `key` and reports whether it is allowed.
 * Allows at most `max` attempts per `windowMs`.
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Opportunistic cleanup so the map cannot grow unbounded.
  if (buckets.size > 1000) {
    for (const [k, timestamps] of buckets) {
      if (!timestamps.some((t) => t > windowStart)) buckets.delete(k);
    }
  }

  const timestamps = (buckets.get(key) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= max) {
    const oldest = timestamps[0];
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return { ok: true };
}
