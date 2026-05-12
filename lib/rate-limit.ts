import { redisRateLimit } from "@/lib/rate-limit/redis";

type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

function inMemoryRateLimit(
  key: string,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number }
): { allowed: boolean; remaining: number } {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

/**
 * Sliding window rate limiter.
 * Tries Redis/Upstash first, falls back to in-memory Map.
 */
export async function rateLimit(
  key: string,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number }
): Promise<{ allowed: boolean; remaining: number }> {
  const redisResult = await redisRateLimit(key, { maxRequests, windowMs });
  if (redisResult) return redisResult;

  return inMemoryRateLimit(key, { maxRequests, windowMs });
}

/**
 * Extracts a rate-limit key from headers or falls back to a default.
 */
export function getRateLimitKey(
  headersList: Headers,
  fallback: string
): string {
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || fallback;
  return ip;
}
