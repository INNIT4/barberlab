import type { PlanId } from "@/lib/data/plans";

type Limits = {
  maxBarbers: number | "unlimited";
  reports: "none" | "basic" | "advanced";
  history: boolean;
};

const LIMITS: Record<PlanId, Limits> = {
  starter: { maxBarbers: 1, reports: "none", history: false },
  pro: { maxBarbers: 5, reports: "basic", history: true },
  premium: { maxBarbers: "unlimited", reports: "advanced", history: true },
};

export function planLimits(plan: PlanId): Limits {
  return LIMITS[plan];
}

export function canAddBarber(plan: PlanId, currentCount: number): boolean {
  const limit = LIMITS[plan].maxBarbers;
  if (limit === "unlimited") return true;
  return currentCount < limit;
}

export function maxBarbersFor(plan: PlanId): number | "unlimited" {
  return LIMITS[plan].maxBarbers;
}

export function formatLimit(limit: number | "unlimited"): string {
  return limit === "unlimited" ? "∞" : String(limit);
}
