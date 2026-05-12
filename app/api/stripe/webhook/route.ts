import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe/client";
import { getPlanFromPriceId } from "@/lib/stripe/prices";
import { db } from "@/lib/db";
import { memberships, organizations, stripeWebhookEvents, notifications } from "@/lib/db/schema";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

function stripeTimestampToDate(val: unknown): Date | null {
  if (!val) return null;
  if (typeof val === "number") return new Date(val * 1000);
  if (typeof val === "string") return new Date(val);
  return null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

async function uniqueSlug(base: string): Promise<string> {
  const slug = base || "barberia";
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await db.query.organizations.findFirst({
      where: eq(organizations.slug, candidate),
      columns: { id: true },
    });
    if (!existing) return candidate;
    suffix++;
  }
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripeCustomerId = session.customer as string;
  const existing = await db.query.organizations.findFirst({
    where: eq(organizations.stripeCustomerId, stripeCustomerId),
    columns: { id: true },
  });
  if (existing) return;

  const email = session.customer_details?.email;
  if (!email) return;

  const businessName = (session.metadata?.businessName ?? email.split("@")[0]).trim();
  const plan = getPlanFromPriceId(session.metadata?.priceId ?? "");

  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id ?? "";
  const periodEnd = stripeTimestampToDate(
    (subscription as unknown as Record<string, unknown>).current_period_end
  );

  const supabase = adminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const existingOrg = await db.query.organizations.findFirst({
    where: eq(organizations.email, email),
    columns: { id: true },
  });

  let userId: string;
  if (existingOrg) {
    const membership = await db.query.memberships.findFirst({
      where: eq(memberships.organizationId, existingOrg.id),
      columns: { userId: true },
    });
    if (membership) {
      userId = membership.userId;
    } else {
      const { data: invited, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${appUrl}/agenda`,
      });
      if (error || !invited.user) throw new Error(`Error invitando usuario: ${error?.message}`);
      userId = invited.user.id;
    }
  } else {
    const { data: invited, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${appUrl}/agenda`,
    });
    if (error || !invited.user) throw new Error(`Error invitando usuario: ${error?.message}`);
    userId = invited.user.id;
  }

  const slug = await uniqueSlug(slugify(businessName));

  await db.transaction(async (tx) => {
    const [org] = await tx
      .insert(organizations)
      .values({
        name: businessName,
        slug,
        plan,
        stripeCustomerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId,
        stripeStatus: subscription.status,
        stripeCurrentPeriodEnd: periodEnd,
      })
      .returning({ id: organizations.id });

    await tx.insert(memberships).values({
      userId,
      organizationId: org.id,
      role: "owner",
    });
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id ?? "";
  const plan = getPlanFromPriceId(priceId);
  const periodEnd = stripeTimestampToDate(
    (subscription as unknown as Record<string, unknown>).current_period_end
  );

  const result = await db
    .update(organizations)
    .set({
      plan,
      stripePriceId: priceId,
      stripeStatus: subscription.status,
      stripeCurrentPeriodEnd: periodEnd,
      stripeSubscriptionId: subscription.id,
    })
    .where(eq(organizations.stripeCustomerId, stripeCustomerId))
    .returning({ id: organizations.id });

  if (result.length === 0) {
    console.warn(`[stripe-webhook] No org found for customer ${stripeCustomerId}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string;

  const result = await db
    .update(organizations)
    .set({
      plan: "starter",
      stripeStatus: "canceled",
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    })
    .where(eq(organizations.stripeCustomerId, stripeCustomerId))
    .returning({ id: organizations.id });

  if (result.length === 0) {
    console.warn(`[stripe-webhook] No org found for customer ${stripeCustomerId}`);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const stripeCustomerId = invoice.customer as string;
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.stripeCustomerId, stripeCustomerId),
    columns: { id: true },
  });
  if (!org) return;

  await db.insert(notifications).values({
    organizationId: org.id,
    title: "Pago rechazado",
    body: "El cobro de tu suscripción falló. Revisa tu método de pago en el portal de facturación.",
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // Idempotencia: si ya procesamos este evento, ignoramos
  try {
    await db.insert(stripeWebhookEvents).values({ id: event.id, type: event.type });
  } catch {
    return new Response("ok");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    revalidatePath("/ajustes");
    revalidatePath("/agenda");
    revalidatePath("/reportes");
  } catch (err) {
    console.error("[stripe-webhook]", err instanceof Error ? err.message : "Unknown error");
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response("ok");
}
