"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { fromZonedTime } from "date-fns-tz";
import { z } from "zod";
import { db } from "@/lib/db";
import { walkIns, barbers, services } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";

const walkInSchema = z.object({
  priceMxn: z.coerce.number().int().positive("El monto debe ser mayor a 0"),
  barberId: z.string().uuid().optional().or(z.literal("")),
  serviceId: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
  date: z.string().min(1, "Fecha requerida"),
});

export type WalkInActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

export async function createWalkInAction(
  _prev: WalkInActionState,
  formData: FormData
): Promise<WalkInActionState> {
  const { org } = await getCurrentOrg();

  const parsed = walkInSchema.safeParse({
    priceMxn: formData.get("priceMxn"),
    barberId: formData.get("barberId"),
    serviceId: formData.get("serviceId"),
    notes: formData.get("notes"),
    date: formData.get("date"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => {
      const field = i.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = i.message;
    });
    return { error: "Revisa los datos", fieldErrors };
  }

  const data = parsed.data;

  const barberId =
    data.barberId && data.barberId.length > 0 ? data.barberId : null;
  const serviceId =
    data.serviceId && data.serviceId.length > 0 ? data.serviceId : null;

  if (barberId) {
    const barber = await db.query.barbers.findFirst({
      where: and(
        eq(barbers.id, barberId),
        eq(barbers.organizationId, org.id)
      ),
    });
    if (!barber) {
      return { error: "Barbero no encontrado" };
    }
  }

  if (serviceId) {
    const service = await db.query.services.findFirst({
      where: and(
        eq(services.id, serviceId),
        eq(services.organizationId, org.id)
      ),
    });
    if (!service) {
      return { error: "Servicio no encontrado" };
    }
  }

  const date = fromZonedTime(`${data.date} 12:00:00`, org.timezone);

  await db.insert(walkIns).values({
    organizationId: org.id,
    barberId,
    serviceId,
    customerId: null,
    priceMxn: data.priceMxn,
    date,
    notes: data.notes && data.notes.length > 0 ? data.notes : null,
  });

  revalidatePath("/walk-ins");
  revalidatePath("/agenda");
  revalidatePath("/reportes");
  return { ok: true };
}

export async function deleteWalkInAction(id: string) {
  const { org } = await getCurrentOrg();

  await db
    .delete(walkIns)
    .where(
      and(eq(walkIns.id, id), eq(walkIns.organizationId, org.id))
    );

  revalidatePath("/walk-ins");
  revalidatePath("/agenda");
  revalidatePath("/reportes");
}
