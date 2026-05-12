interface RedisConfig {
  url: string;
  token: string;
}

let _config: RedisConfig | null = null;

function getConfig(): RedisConfig | null {
  if (_config) return _config;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _config = { url, token };
  return _config;
}

export async function redisRateLimit(
  key: string,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number }
): Promise<{ allowed: boolean; remaining: number } | null> {
  const config = getConfig();
  if (!config) return null;

  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    const res = await fetch(
      `${config.url}/pipeline`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pipeline: [
            ["ZREMRANGEBYSCORE", key, "0", String(windowStart)],
            ["ZCARD", key],
            ["ZADD", key, String(now), `${now}-${Math.random()}`],
            ["EXPIRE", key, String(Math.ceil(windowMs / 1000) + 1)],
          ],
        }),
        signal: AbortSignal.timeout(2000),
      }
    );

    if (!res.ok) return null;

    const results = (await res.json()) as [null, number, number, number];
    const count = results[1] ?? 0;
    const allowed = count < maxRequests;
    return { allowed, remaining: Math.max(0, maxRequests - count - 1) };
  } catch {
    return null;
  }
}
