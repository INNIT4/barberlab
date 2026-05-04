"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { and, eq, gt } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { organizations, memberships, services, invitations } from "@/lib/db/schema";

// ============================================================================
// Schemas
// ============================================================================
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

const signupSchema = z.object({
  owner: z.string().min(2, "Ingresa tu nombre"),
  shop: z.string().min(2, "Ingresa el nombre de la barbería"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Teléfono demasiado corto"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "Solo letras minúsculas, números y guiones"
    ),
});

const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// ============================================================================
// Helpers
// ============================================================================
const DEMO_SERVICES = [
  { name: "Corte clásico", category: "Corte" as const, duration: 30, price: 200 },
  { name: "Corte + barba", category: "Combo" as const, duration: 45, price: 280 },
  { name: "Fade americano", category: "Corte" as const, duration: 40, price: 250 },
  { name: "Arreglo de barba", category: "Barba" as const, duration: 20, price: 150 },
  { name: "Diseño", category: "Extras" as const, duration: 15, price: 120 },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function getSiteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const proto = process.env.NODE_ENV === "production" ? "https" : "http";
    return `${proto}://${host}`;
  } catch {
    return "http://localhost:3000";
  }
}

// ============================================================================
// Login
// ============================================================================
export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Revisa los datos ingresados" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Credenciales incorrectas" };
  }

  redirect("/agenda");
}

// ============================================================================
// Signup (invite helper)
// ============================================================================
async function handleInviteSignup(inviteToken: string, formData: FormData): Promise<ActionState> {
  const email = (formData.get("email") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";
  const owner = (formData.get("owner") as string)?.trim() ?? "";

  if (!email.includes("@") || password.length < 8 || owner.length < 2) {
    return { error: "Revisa los datos ingresados" };
  }

  const invitation = await db.query.invitations.findFirst({
    where: and(
      eq(invitations.token, inviteToken),
      gt(invitations.expiresAt, new Date())
    ),
  });

  if (!invitation || invitation.acceptedAt) {
    return { error: "La invitación es inválida o ya expiró. Pide un nuevo enlace." };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { owner_name: owner } },
  });

  if (authError || !authData.user) {
    if (authError?.message.includes("already registered")) {
      return { error: "Ya existe una cuenta con ese email", fieldErrors: { email: "Ya existe una cuenta con ese email" } };
    }
    return { error: authError?.message ?? "Error al crear la cuenta" };
  }

  const userId = authData.user.id;

  try {
    await db.transaction(async (tx) => {
      await tx.insert(memberships).values({
        userId,
        organizationId: invitation.organizationId,
        role: invitation.role,
      });
      await tx
        .update(invitations)
        .set({ acceptedAt: new Date() })
        .where(eq(invitations.id, invitation.id));
    });
  } catch (err) {
    console.error("Staff signup failed:", err);
    return { error: "Error uniéndote a la barbería. Intenta de nuevo." };
  }

  redirect("/agenda");
}

// ============================================================================
// Signup
// ============================================================================
export async function signupAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Verificar si viene con token de invitación (antes que nada)
  const inviteToken = (formData.get("invite") as string)?.trim() ?? "";

  if (inviteToken) {
    return await handleInviteSignup(inviteToken, formData);
  }

  // Flujo normal: crear nueva barbería
  const rawSlug = (formData.get("slug") as string | null) ?? "";
  const normalizedSlug = slugify(rawSlug || (formData.get("shop") as string) || "");

  const parsed = signupSchema.safeParse({
    owner: formData.get("owner"),
    shop: formData.get("shop"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    slug: normalizedSlug,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    });
    return { error: "Revisa los datos", fieldErrors };
  }

  const data = parsed.data;

  // Flujo normal: crear nueva organización
  const existing = await db.query.organizations.findFirst({
    where: eq(organizations.slug, data.slug),
  });
  if (existing) {
    return {
      error: "Esa URL ya está en uso",
      fieldErrors: { slug: "Elige otra URL pública" },
    };
  }

  // Crear usuario en Supabase Auth
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { owner_name: data.owner },
    },
  });

  if (authError || !authData.user) {
    if (authError?.message.includes("already registered")) {
      return {
        error: "Ya existe una cuenta con ese email",
        fieldErrors: { email: "Ya existe una cuenta con ese email" },
      };
    }
    return { error: authError?.message ?? "Error al crear la cuenta" };
  }

  const userId = authData.user.id;

  // Crear organización + membership + servicios demo (transacción)
  try {
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14);

    await db.transaction(async (tx) => {
      const [org] = await tx
        .insert(organizations)
        .values({
          slug: data.slug,
          name: data.shop,
          phone: data.phone,
          email: data.email,
          plan: "premium",
          trialEndsAt: trialEnds,
        })
        .returning();

      await tx.insert(memberships).values({
        userId,
        organizationId: org.id,
        role: "owner",
      });

      await tx.insert(services).values(
        DEMO_SERVICES.map((s, i) => ({
          organizationId: org.id,
          name: s.name,
          category: s.category,
          durationMinutes: s.duration,
          priceMxn: s.price,
          sortOrder: i,
        }))
      );
    });
  } catch (err) {
    console.error("Signup org creation failed:", err);
    return {
      error: "Error creando la barbería. Intenta de nuevo o contáctanos.",
    };
  }

  redirect("/agenda");
}

// ============================================================================
// Logout
// ============================================================================
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ============================================================================
// Password Reset
// ============================================================================
export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = (formData.get("email") as string) ?? "";

  if (!email.includes("@")) {
    return { error: "Ingresa un email válido" };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/actualizar-contrasena`,
  });

  if (error) {
    return {
      error:
        "No pudimos enviar el correo. Verifica el email o intenta más tarde.",
    };
  }

  return { ok: true };
}

// ============================================================================
// Update Password (after recovery)
// ============================================================================
export async function updatePasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    });
    return { error: "Revisa los datos", fieldErrors };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "El enlace expiró. Solicita uno nuevo desde la página de recuperación." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "El enlace expiró. Solicita uno nuevo desde la página de recuperación." };
  }

  redirect("/agenda");
}

// ============================================================================
// Google OAuth
// ============================================================================
export async function signInWithGoogleAction() {
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (data.url) {
    redirect(data.url);
  }

  if (error) {
    redirect("/login?error=google");
  }

  redirect("/login?error=google");
}
