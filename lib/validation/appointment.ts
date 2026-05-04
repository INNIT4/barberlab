import { z } from "zod";

export const APPOINTMENT_STATUSES = [
  "confirmada",
  "pendiente",
  "completada",
  "cancelada",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const newCustomerInAppointmentSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  phone: z.string().min(8, "Teléfono demasiado corto"),
});

export const appointmentSchema = z
  .object({
    barberId: z.string().uuid("Selecciona un barbero"),
    serviceId: z.string().uuid("Selecciona un servicio"),
    customerId: z.string().uuid().optional().or(z.literal("")),
    newCustomerName: z.string().optional(),
    newCustomerPhone: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (d) => {
      const hasExisting = d.customerId && d.customerId.length > 0;
      const hasNew =
        (d.newCustomerName?.trim().length ?? 0) >= 2 &&
        (d.newCustomerPhone?.trim().length ?? 0) >= 8;
      return hasExisting || hasNew;
    },
    { message: "Selecciona un cliente o ingresa nombre + teléfono", path: ["customerId"] }
  );

export type AppointmentInput = z.infer<typeof appointmentSchema>;
