import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión — BarberLab",
  description: "Accede a tu panel de BarberLab.",
};

export default function LoginPage() {
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Bienvenido de vuelta.
        </h1>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
          Entra a tu panel para ver la agenda del día.
        </p>
      </div>

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm sm:p-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-[color:var(--muted-foreground)]">
        ¿Todavía no tienes cuenta?{" "}
        <Link
          href="/signup"
          className="font-medium text-[color:var(--foreground)] underline-offset-4 hover:underline"
        >
          Prueba 1 mes gratis
        </Link>
      </p>
    </div>
  );
}
