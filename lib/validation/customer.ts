import { z } from "zod";

export const CUSTOMER_TAGS = ["VIP", "Regular", "Nuevo"] as const;

export const customerSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80, "Máximo 80 caracteres"),
  phone: z
    .string()
    .min(8, "Teléfono demasiado corto")
    .max(30, "Teléfono demasiado largo"),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  notes: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  tag: z.enum(CUSTOMER_TAGS).optional().or(z.literal("")).transform((v) =>
    v && v.length > 0 ? (v as (typeof CUSTOMER_TAGS)[number]) : undefined
  ),
});

export type CustomerInput = z.infer<typeof customerSchema>;
