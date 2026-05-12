import { describe, it, expect, vi, beforeEach } from "vitest";

const { getSiteUrl } = await vi.importActual<typeof import("@/lib/env")>("@/lib/env");

describe("getSiteUrl", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns NEXT_PUBLIC_SITE_URL if set", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://other.com");
    expect(getSiteUrl()).toBe("https://example.com");
  });

  it("falls back to NEXT_PUBLIC_APP_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.com");
    expect(getSiteUrl()).toBe("https://app.example.com");
  });

  it("falls back to barberlab.app in production", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_APP_URL", undefined);
    vi.stubEnv("NODE_ENV", "production");
    expect(getSiteUrl()).toBe("https://barberlab.app");
  });

  it("falls back to localhost in development", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_APP_URL", undefined);
    vi.stubEnv("NODE_ENV", "development");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
