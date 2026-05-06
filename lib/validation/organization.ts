import { z } from "zod";

const optionalText = (max: number, message?: string) =>
  z
    .string()
    .max(max, message ?? `Máximo ${max} caracteres`)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.length > 0 ? v : undefined));

const optionalUrl = z
  .string()
  .url("URL inválida")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? v : undefined));

const mapsUrlSchema = z
  .string()
  .url("URL inválida")
  .refine(
    (url) =>
      url.startsWith("https://maps.app.goo.gl/") ||
      url.startsWith("https://goo.gl/maps/") ||
      url.startsWith("https://www.google.com/maps/") ||
      url.startsWith("https://maps.google.com/"),
    "Solo se permiten URLs de Google Maps"
  )
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? v : undefined));

export const organizationSchema = z.object({
  name: z.string().min(2, "Ingresa un nombre").max(80, "Máximo 80 caracteres"),
  slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  phone: optionalText(30),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  address: optionalText(200),
});

export const brandingSchema = z.object({
  tagline: optionalText(120),
  about: optionalText(1000),
  addressNotes: optionalText(200),
  logoUrl: optionalUrl,
  heroImageUrl: optionalUrl,
  primaryColor: z
    .string()
    .regex(
      /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$|^#[0-9a-fA-F]{6}$/,
      "Usa OKLCH o HEX"
    )
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  googleMapsUrl: mapsUrlSchema,
  cancellationPolicy: optionalText(2000),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
export type BrandingInput = z.infer<typeof brandingSchema>;
