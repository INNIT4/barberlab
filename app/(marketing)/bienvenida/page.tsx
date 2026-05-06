import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "¡Bienvenido a BarberLab!",
  robots: { index: false, follow: false },
};

export default function BienvenidaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--paper)] px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[oklch(0.92_0.08_145)]">
          <CheckCircle className="h-8 w-8 text-[oklch(0.45_0.15_145)]" />
        </div>

        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[color:var(--ink)]">
          ¡Pago recibido!
        </h1>
        <p className="mt-3 text-[color:var(--muted-foreground)]">
          Tu cuenta está siendo configurada. En unos segundos recibirás un email
          con tu enlace de acceso al panel.
        </p>

        <div className="mt-8 rounded-2xl border border-[color:var(--ink)]/10 bg-[color:var(--card)] p-6">
          <Mail className="mx-auto mb-3 h-8 w-8 text-[color:var(--muted-foreground)]" />
          <p className="font-serif text-base font-semibold text-[color:var(--ink)]">
            Revisa tu bandeja de entrada
          </p>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            Te enviamos un enlace mágico para entrar a tu barbería sin
            contraseña. Revisa también la carpeta de spam.
          </p>
        </div>

        <p className="mt-8 text-sm text-[color:var(--muted-foreground)]">
          ¿Ya tienes el enlace?{" "}
          <Link
            href="/login"
            className="font-medium text-[color:var(--ink)] underline underline-offset-4"
          >
            Ir al login
          </Link>
        </p>
      </div>
    </div>
  );
}
