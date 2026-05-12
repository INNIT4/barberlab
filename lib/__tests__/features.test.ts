import { describe, it, expect } from "vitest";
import {
  canAddBarber,
  canUseBranding,
  canUseExpenses,
  canUseCustomerTags,
  reportsLevel,
  canExportData,
} from "@/lib/features/can";

describe("feature gating", () => {
  describe("starter plan", () => {
    const plan = "starter";
    it("allows 1 barber max", () => {
      expect(canAddBarber(plan, 0)).toBe(true);
      expect(canAddBarber(plan, 1)).toBe(false);
    });
    it("has branding", () => expect(canUseBranding(plan)).toBe(true));
    it("has expenses", () => expect(canUseExpenses(plan)).toBe(true));
    it("has customer tags", () => expect(canUseCustomerTags(plan)).toBe(true));
    it("advanced reports", () => expect(reportsLevel(plan)).toBe("advanced"));
    it("has export", () => expect(canExportData(plan)).toBe(true));
  });

  describe("pro plan", () => {
    const plan = "pro";
    it("allows 3 barbers", () => {
      expect(canAddBarber(plan, 2)).toBe(true);
      expect(canAddBarber(plan, 3)).toBe(false);
    });
    it("has branding", () => expect(canUseBranding(plan)).toBe(true));
    it("has expenses", () => expect(canUseExpenses(plan)).toBe(true));
    it("has customer tags", () => expect(canUseCustomerTags(plan)).toBe(true));
    it("advanced reports", () => expect(reportsLevel(plan)).toBe("advanced"));
    it("has export", () => expect(canExportData(plan)).toBe(true));
  });

  describe("premium plan", () => {
    const plan = "premium";
    it("allows 5 barbers", () => {
      expect(canAddBarber(plan, 4)).toBe(true);
      expect(canAddBarber(plan, 5)).toBe(false);
    });
    it("has branding", () => expect(canUseBranding(plan)).toBe(true));
    it("has expenses", () => expect(canUseExpenses(plan)).toBe(true));
    it("has customer tags", () => expect(canUseCustomerTags(plan)).toBe(true));
    it("advanced reports", () => expect(reportsLevel(plan)).toBe("advanced"));
    it("has export", () => expect(canExportData(plan)).toBe(true));
  });
});
