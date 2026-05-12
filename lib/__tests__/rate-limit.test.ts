import { describe, it, expect, vi, beforeEach } from "vitest";

const { rateLimit } = await vi.importActual<typeof import("@/lib/rate-limit")>("@/lib/rate-limit");

describe("rateLimit (in-memory)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  it("allows requests within limit", async () => {
    for (let i = 0; i < 5; i++) {
      const result = await rateLimit("test-key", {
        maxRequests: 5,
        windowMs: 60_000,
      });
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks requests exceeding limit", async () => {
    for (let i = 0; i < 5; i++) {
      await rateLimit("test-key-2", { maxRequests: 5, windowMs: 60_000 });
    }
    const result = await rateLimit("test-key-2", {
      maxRequests: 5,
      windowMs: 60_000,
    });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets window after expiry", async () => {
    for (let i = 0; i < 3; i++) {
      await rateLimit("test-key-3", { maxRequests: 3, windowMs: 30_000 });
    }
    vi.advanceTimersByTime(30_001);
    const result = await rateLimit("test-key-3", {
      maxRequests: 3,
      windowMs: 30_000,
    });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("returns correct remaining count", async () => {
    const r1 = await rateLimit("test-key-4", {
      maxRequests: 10,
      windowMs: 60_000,
    });
    expect(r1.remaining).toBe(9);

    const r2 = await rateLimit("test-key-4", {
      maxRequests: 10,
      windowMs: 60_000,
    });
    expect(r2.remaining).toBe(8);
  });
});
