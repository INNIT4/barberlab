"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { stripe } from "@/lib/stripe/client";
import { getPriceId } from "@/lib/stripe/prices";
import type { PlanId } from "@/lib/data/plans";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

const schema = z.object({
  plan: z.enum(["starter", "pro", "premium"]),
  email: z.string().email("Email inválido"),
  businessName: z.string().min(2, "Escribe el nombre de tu barbería").max(80),
});

export type CheckoutState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createCheckoutSessionAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const headersList = await headers();
  const ip = getRateLimitKey(headersList, "checkout");
  const { allowed } = await rateLimit(`checkout:${ip}`, { maxRequests: 5, windowMs: 60_000 });
  if (!allowed) return { error: "Demasiados intentos. Espera un minuto." };

  const parsed = schema.safeParse({
    plan: formData.get("plan"),
    email: formData.get("email"),
    businessName: formData.get("businessName"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => {
      const field = i.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = i.message;
    });
    return { fieldErrors };
  }

  const { plan, email, businessName } = parsed.data;

  const priceId = getPriceId(plan as PlanId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { plan, businessName, priceId },
      payment_method_collection: "if_required",
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 30,
        metadata: { plan, businessName },
      },
      success_url: `${appUrl}/bienvenida?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/precios`,
    });

    redirect(session.url!);
  } catch {
    return { error: "No se pudo iniciar el pago. Intenta de nuevo." };
  }
}
