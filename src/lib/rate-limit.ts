// Simple per-IP sliding-window rate limiter for serverless.
// NOTE: in-memory counters are per-instance (not 100% distributed),
// but they raise the attack cost substantially. Layer 2 of defense.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateResult {
  allowed: boolean;
  retryAfter?: number;
  remaining?: number;
}

const WINDOW_MS = 15 * 60 * 1000; // 15 min
const MAX_ATTEMPTS = 10; // max login attempts per window

export function rateLimit(key: string, limit = MAX_ATTEMPTS, windowMs = WINDOW_MS): RateResult {
  if (typeof globalThis === "undefined") return { allowed: true };
  // Use a module-level map captured at runtime; keep it small.
  const now = Date.now();
  const hit = buckets.get(key);
  if (!hit || now >= hit.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (hit.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((hit.resetAt - now) / 1000) };
  }
  hit.count += 1;
  return { allowed: true, remaining: limit - hit.count };
}

// Best-effort bound so the map cannot grow unbounded across long uptimes.
let sweeps = 0;
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (now >= v.resetAt) buckets.delete(k);
  }
  sweeps += 1;
  if (sweeps > 60) {
    sweeps = 0;
    if (buckets.size > 1000) buckets.clear(); // emergency cap
  }
}, 60 * 1000).unref?.();