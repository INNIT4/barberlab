"use server";

import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/client";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { getPriceId } from "@/lib/stripe/prices";
import type { PlanId } from "@/lib/data/plans";

export async function createBillingPortalSessionAction(): Promise<
  { url: string; error?: undefined } | { error: string; url?: undefined }
> {
  const { org, role } = await getCurrentOrg({ skipTrialRedirect: true });
  if (role !== "owner") return { error: "Solo el dueño puede gestionar la facturación" };

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `billing:${org.id}`);
  const { allowed } = await rateLimit(`billing:${ip}`, { maxRequests: 5, windowMs: 60_000 });
  if (!allowed) return { error: "Demasiados intentos. Espera un minuto." };

  if (!org.stripeCustomerId) {
    return { error: "No hay suscripción activa de Stripe" };
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${appUrl}/ajustes`,
    });

    return { url: session.url };
  } catch {
    return { error: "No se pudo abrir el portal de facturación. Intenta de nuevo." };
  }
}

export async function createSubscriptionCheckoutAction(
  planOverride?: PlanId
): Promise<
  { url: string; error?: undefined } | { error: string; url?: undefined }
> {
  const { org, role } = await getCurrentOrg({ skipTrialRedirect: true });
  if (role !== "owner") return { error: "Solo el dueño puede gestionar la facturación" };

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `billing:${org.id}`);
  const { allowed } = await rateLimit(`billing:${ip}`, { maxRequests: 5, windowMs: 60_000 });
  if (!allowed) return { error: "Demasiados intentos. Espera un minuto." };

  const plan = planOverride ?? (org.plan as PlanId);
  const priceId = getPriceId(plan);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: org.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { plan, organizationId: org.id, priceId },
      allow_promotion_codes: true,
      subscription_data: { metadata: { plan, organizationId: org.id } },
      success_url: `${appUrl}/ajustes?subscription=success`,
      cancel_url: `${appUrl}/ajustes`,
    });

    return { url: session.url! };
  } catch {
    return { error: "No se pudo iniciar el pago. Intenta de nuevo." };
  }
}
