"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { canUseExpenses } from "@/lib/features/can";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
import { buildFieldErrors } from "@/lib/validation/helpers";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

const expenseSchema = z.object({
  description: z.string().min(2, "Describe el gasto"),
  amount: z.coerce.number().int().min(1, "Monto inválido"),
  category: z.enum(["Productos", "Alquiler", "Servicios", "Salarios", "Marketing", "Otro"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  notes: z.string().optional(),
});

export type ExpenseActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

export async function createExpenseAction(
  _prev: ExpenseActionState,
  formData: FormData
): Promise<ExpenseActionState> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede registrar gastos" };
  if (!canUseExpenses(org.plan)) return { error: "Necesitas el plan Pro para registrar gastos" };

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `expense-create:${org.id}`);
  const { allowed } = await rateLimit(`expense-create:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) return { error: "Demasiados intentos. Espera un minuto." };

  const parsed = expenseSchema.safeParse({
    description: formData.get("description"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    date: formData.get("date"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: "Revisa los datos", fieldErrors: buildFieldErrors(parsed.error.issues) };
  }

  const data = parsed.data;

  await db.insert(expenses).values({
    organizationId: org.id,
    description: data.description,
    amountMxn: data.amount,
    category: data.category,
    date: fromZonedTime(`${data.date} 12:00:00`, org.timezone),
    notes: data.notes?.trim() || null,
  });

  revalidatePath("/gastos");
  revalidatePath("/reportes");
  return { ok: true };
}

export async function updateExpenseAction(
  _prev: ExpenseActionState,
  formData: FormData
): Promise<ExpenseActionState> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede modificar gastos" };
  if (!canUseExpenses(org.plan)) return { error: "Necesitas el plan Pro para modificar gastos" };

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `expense-update:${org.id}`);
  const { allowed } = await rateLimit(`expense-update:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) return { error: "Demasiados intentos. Espera un minuto." };

  const id = formData.get("id") as string;
  if (!id) return { error: "Gasto no encontrado" };

  const parsed = expenseSchema.safeParse({
    description: formData.get("description"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    date: formData.get("date"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: "Revisa los datos", fieldErrors: buildFieldErrors(parsed.error.issues) };
  }

  const data = parsed.data;

  const [updated] = await db
    .update(expenses)
    .set({
      description: data.description,
      amountMxn: data.amount,
      category: data.category,
      date: fromZonedTime(`${data.date} 12:00:00`, org.timezone),
      notes: data.notes?.trim() || null,
      updatedAt: new Date(),
    })
    .where(and(eq(expenses.id, id), eq(expenses.organizationId, org.id)))
    .returning({ id: expenses.id });

  if (!updated) return { error: "Gasto no encontrado" };

  revalidatePath("/gastos");
  revalidatePath("/reportes");
  return { ok: true };
}

export async function deleteExpenseAction(id: string): Promise<ExpenseActionState | void> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede eliminar gastos" };
  if (!canUseExpenses(org.plan)) return { error: "Necesitas el plan Pro para eliminar gastos" };

  if (!z.string().uuid().safeParse(id).success) return;

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `expense-delete:${org.id}`);
  const { allowed } = await rateLimit(`expense-delete:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!allowed) return;

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.organizationId, org.id)));
  revalidatePath("/gastos");
  revalidatePath("/reportes");
}
