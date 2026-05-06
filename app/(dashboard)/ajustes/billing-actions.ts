"use server";

import { stripe } from "@/lib/stripe/client";
import { getCurrentOrg } from "@/lib/auth/current-user";

export async function createBillingPortalSessionAction(): Promise<
  { url: string; error?: undefined } | { error: string; url?: undefined }
> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede gestionar la facturación" };

  if (!org.stripeCustomerId) {
    return { error: "No hay suscripción activa de Stripe" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${appUrl}/ajustes`,
  });

  return { url: session.url };
}
