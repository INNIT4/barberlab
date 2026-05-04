import { z } from "zod";

export const SERVICE_CATEGORIES = ["Corte", "Barba", "Combo", "Extras"] as const;

export const serviceSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80, "Máximo 80 caracteres"),
  category: z.enum(SERVICE_CATEGORIES),
  durationMinutes: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(5, "Mínimo 5 minutos")
    .max(480, "Máximo 8 horas"),
  priceMxn: z.coerce
    .number()
    .int("Sin decimales")
    .min(0, "No puede ser negativo")
    .max(100000, "Precio demasiado alto"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
