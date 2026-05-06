import type { PlanId } from "@/lib/data/plans";

export function getPriceId(plan: PlanId): string {
  const map: Record<PlanId, string | undefined> = {
    starter: process.env.STRIPE_PRICE_STARTER,
    pro: process.env.STRIPE_PRICE_PRO,
    premium: process.env.STRIPE_PRICE_PREMIUM,
  };
  const priceId = map[plan];
  if (!priceId) throw new Error(`STRIPE_PRICE_${plan.toUpperCase()} no está definida`);
  return priceId;
}

export function getPlanFromPriceId(priceId: string): PlanId {
  const map: Record<string, PlanId> = {
    [process.env.STRIPE_PRICE_STARTER ?? ""]: "starter",
    [process.env.STRIPE_PRICE_PRO ?? ""]: "pro",
    [process.env.STRIPE_PRICE_PREMIUM ?? ""]: "premium",
  };
  return map[priceId] ?? "starter";
}
