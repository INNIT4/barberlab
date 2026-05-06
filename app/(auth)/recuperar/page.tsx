import type { Metadata } from "next";
import Link from "next/link";
import { RecuperarForm } from "./form";

export const metadata: Metadata = {
  title: "Recuperar contraseña — BarberLab",
  description: "Recupera el acceso a tu cuenta de BarberLab.",
};

export default function RecuperarPage() {
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Recupera tu acceso.
        </h1>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
          Te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm sm:p-8">
        <RecuperarForm />
      </div>

      <p className="mt-6 text-center text-sm text-[color:var(--muted-foreground)]">
        <Link
          href="/login"
          className="font-medium text-[color:var(--foreground)] underline-offset-4 hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}
