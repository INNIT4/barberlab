import { describe, it, expect } from "vitest";
import {
  isExclusionViolation,
  isUniqueViolation,
  isPgError,
  PG_ERROR_CODES,
} from "@/lib/db/errors";

describe("db errors", () => {
  it("detects exclusion violation", () => {
    expect(isExclusionViolation({ code: "23P01" })).toBe(true);
    expect(isExclusionViolation({ code: "23505" })).toBe(false);
    expect(isExclusionViolation(null)).toBe(false);
    expect(isExclusionViolation("error")).toBe(false);
  });

  it("detects unique violation", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
    expect(isUniqueViolation({ code: "23P01" })).toBe(false);
    expect(isUniqueViolation(undefined)).toBe(false);
  });

  it("isPgError matches generic code check", () => {
    expect(isPgError({ code: "42P01" }, "42P01")).toBe(true);
    expect(isPgError({ code: "42P01" }, "23P01")).toBe(false);
    expect(isPgError(null, "23P01")).toBe(false);
  });

  it("has all expected error codes", () => {
    expect(PG_ERROR_CODES.EXCLUSION_VIOLATION).toBe("23P01");
    expect(PG_ERROR_CODES.UNIQUE_VIOLATION).toBe("23505");
    expect(PG_ERROR_CODES.FOREIGN_KEY_VIOLATION).toBe("23503");
    expect(PG_ERROR_CODES.CHECK_VIOLATION).toBe("23514");
  });
});
