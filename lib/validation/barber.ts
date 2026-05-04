import { z } from "zod";

export const BARBER_TONES = [
  "oklch(0.88 0.08 60)",
  "oklch(0.88 0.08 25)",
  "oklch(0.88 0.08 150)",
  "oklch(0.88 0.08 240)",
  "oklch(0.88 0.08 300)",
] as const;

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato HH:MM");

const daySchedule = z
  .object({
    start: timeString,
    end: timeString,
  })
  .nullable()
  .refine(
    (v) => v === null || v.start < v.end,
    "La hora de inicio debe ser antes que la de cierre"
  );

export const workingHoursSchema = z.object({
  mon: daySchedule,
  tue: daySchedule,
  wed: daySchedule,
  thu: daySchedule,
  fri: daySchedule,
  sat: daySchedule,
  sun: daySchedule,
});

export const barberSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80, "Máximo 80 caracteres"),
  role: z.string().min(2, "Ingresa un rol").max(40, "Máximo 40 caracteres").default("Barbero"),
  phone: z
    .string()
    .max(30, "Teléfono demasiado largo")
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined)),
  avatarTone: z.string().default(BARBER_TONES[0]),
  workingHours: workingHoursSchema,
});

export type BarberInput = z.infer<typeof barberSchema>;
