import type { Metadata } from "next";
import { ActualizarContrasenaForm } from "./form";

export const metadata: Metadata = {
  title: "Nueva contraseña — BarberApp",
  description: "Crea una nueva contraseña para tu cuenta.",
};

export default function ActualizarContrasenaPage() {
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Crea una nueva contraseña.
        </h1>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
          Elige una contraseña segura que no uses en otros servicios.
        </p>
      </div>

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm sm:p-8">
        <ActualizarContrasenaForm />
      </div>
    </div>
  );
}
