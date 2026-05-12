import type { PlanId } from "@/lib/data/plans";

type Limits = {
  maxBarbers: number | "unlimited";
  branding: boolean;
  expenses: boolean;
  customerHistory: boolean;
  customerTags: boolean;
  reports: "none" | "basic" | "advanced";
  exportData: boolean;
};

const LIMITS: Record<PlanId, Limits> = {
  starter: {
    maxBarbers: 1,
    branding: true,
    expenses: true,
    customerHistory: true,
    customerTags: true,
    reports: "advanced",
    exportData: true,
  },
  pro: {
    maxBarbers: 3,
    branding: true,
    expenses: true,
    customerHistory: true,
    customerTags: true,
    reports: "advanced",
    exportData: true,
  },
  premium: {
    maxBarbers: 5,
    branding: true,
    expenses: true,
    customerHistory: true,
    customerTags: true,
    reports: "advanced",
    exportData: true,
  },
};

export function planLimits(plan: PlanId): Limits {
  return LIMITS[plan];
}

export function canAddBarber(plan: PlanId, currentCount: number): boolean {
  const limit = LIMITS[plan].maxBarbers;
  if (limit === "unlimited") return true;
  return currentCount < limit;
}

export function canUseBranding(plan: PlanId): boolean {
  return LIMITS[plan].branding;
}

export function canUseExpenses(plan: PlanId): boolean {
  return LIMITS[plan].expenses;
}

export function canViewCustomerHistory(plan: PlanId): boolean {
  return LIMITS[plan].customerHistory;
}

export function canUseCustomerTags(plan: PlanId): boolean {
  return LIMITS[plan].customerTags;
}

export function reportsLevel(plan: PlanId): "none" | "basic" | "advanced" {
  return LIMITS[plan].reports;
}

export function canExportData(plan: PlanId): boolean {
  return LIMITS[plan].exportData;
}

export function maxBarbersFor(plan: PlanId): number | "unlimited" {
  return LIMITS[plan].maxBarbers;
}

export function formatLimit(limit: number | "unlimited"): string {
  return limit === "unlimited" ? "∞" : String(limit);
}
