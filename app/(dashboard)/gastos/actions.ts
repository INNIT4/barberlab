"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { z as z3 } from "zod";

const expenseSchema = z3.object({
  description: z3.string().min(2, "Describe el gasto"),
  amount: z3.coerce.number().int().min(1, "Monto inválido"),
  category: z3.enum(["Productos", "Alquiler", "Servicios", "Salarios", "Marketing", "Otro"]),
  date: z3.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  notes: z3.string().optional(),
});

export type ExpenseActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

function buildFieldErrors(issues: z3.ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export async function createExpenseAction(
  _prev: ExpenseActionState,
  formData: FormData
): Promise<ExpenseActionState> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede registrar gastos" };

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
    date: new Date(`${data.date}T12:00:00-07:00`),
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
      date: new Date(`${data.date}T12:00:00-07:00`),
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

export async function deleteExpenseAction(id: string) {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") throw new Error("Solo el dueño puede eliminar gastos");
  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.organizationId, org.id)));
  revalidatePath("/gastos");
  revalidatePath("/reportes");
}
