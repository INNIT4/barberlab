"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { customerSchema } from "@/lib/validation/customer";

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

function buildFieldErrors(issues: z.ZodIssue[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  issues.forEach((issue) => {
    const field = issue.path[0] as string;
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  });
  return fieldErrors;
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
  const parsed = parseFormData(formData);

  if (!parsed.success) {
    return {
      error: "Revisa los datos",
      fieldErrors: buildFieldErrors(parsed.error.issues),
    };
  }

  try {
    await db.insert(customers).values({
      organizationId: org.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email ?? null,
      notes: parsed.data.notes ?? null,
      tag: parsed.data.tag ?? null,
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

  try {
    const [updated] = await db
      .update(customers)
      .set({
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email ?? null,
        notes: parsed.data.notes ?? null,
        tag: parsed.data.tag ?? null,
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
  const { org } = await getCurrentOrg();

  await db
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.organizationId, org.id)));

  revalidatePath("/clientes");
}
