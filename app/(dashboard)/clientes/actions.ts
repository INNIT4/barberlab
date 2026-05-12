"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { canUseCustomerTags } from "@/lib/features/can";
import { customerSchema } from "@/lib/validation/customer";
import { buildFieldErrors } from "@/lib/validation/helpers";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export type CustomerActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

function parseFormData(formData: FormData) {
  return customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    notes: formData.get("notes") ?? "",
    tag: formData.get("tag") ?? "",
  });
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23505"
  );
}

export async function createCustomerAction(
  _prev: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const { org } = await getCurrentOrg();

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `customer-create:${org.id}`);
  const { allowed } = await rateLimit(`customer-create:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) return { error: "Demasiados clientes. Espera un minuto." };

  const parsed = parseFormData(formData);

  if (!parsed.success) {
    return {
      error: "Revisa los datos",
      fieldErrors: buildFieldErrors(parsed.error.issues),
    };
  }

  const tagAllowed = canUseCustomerTags(org.plan);

  try {
    await db.insert(customers).values({
      organizationId: org.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email ?? null,
      notes: parsed.data.notes ?? null,
      tag: tagAllowed ? (parsed.data.tag ?? null) : null,
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return {
        error: "Ya existe un cliente con ese teléfono",
        fieldErrors: { phone: "Este teléfono ya está registrado" },
      };
    }
    throw err;
  }

  revalidatePath("/clientes");
  return { ok: true };
}

export async function updateCustomerAction(
  _prev: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const { org } = await getCurrentOrg();

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `customer-update:${org.id}`);
  const { allowed } = await rateLimit(`customer-update:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) return { error: "Demasiados intentos. Espera un minuto." };

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Cliente inválido" };
  }

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return {
      error: "Revisa los datos",
      fieldErrors: buildFieldErrors(parsed.error.issues),
    };
  }

  const tagAllowed = canUseCustomerTags(org.plan);

  try {
    const [updated] = await db
      .update(customers)
      .set({
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email ?? null,
        notes: parsed.data.notes ?? null,
        tag: tagAllowed ? (parsed.data.tag ?? null) : null,
        updatedAt: new Date(),
      })
      .where(and(eq(customers.id, id), eq(customers.organizationId, org.id)))
      .returning({ id: customers.id });

    if (!updated) {
      return { error: "Cliente no encontrado" };
    }
  } catch (err) {
    if (isUniqueViolation(err)) {
      return {
        error: "Ya existe un cliente con ese teléfono",
        fieldErrors: { phone: "Este teléfono ya está registrado" },
      };
    }
    throw err;
  }

  revalidatePath("/clientes");
  return { ok: true };
}

export async function deleteCustomerAction(id: string) {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return;

  if (!z.string().uuid().safeParse(id).success) return;

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `customer-delete:${org.id}`);
  const { allowed } = await rateLimit(`customer-delete:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!allowed) return;

  await db
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.organizationId, org.id)));

  revalidatePath("/clientes");
}
