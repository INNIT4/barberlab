import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto — BarberLab",
  description: "Escríbenos por WhatsApp o email. Soporte en español para barberías mexicanas.",
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">
        Hablemos
      </h1>
      <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
        Estamos aquí para ayudarte. Sin bots, sin formularios interminables.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <a
          href="https://wa.me/5216621234567"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-[oklch(0.85_0.06_150)] bg-[oklch(0.97_0.03_150)] p-6 transition-colors hover:bg-[oklch(0.95_0.05_150)]"
        >
          <p className="font-serif text-lg font-semibold">WhatsApp</p>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            +52 662 123 4567
          </p>
          <p className="mt-2 text-xs text-[oklch(0.4_0.1_150)]">
            Respuesta en menos de 2 horas en horario laboral.
          </p>
        </a>

        <a
          href="mailto:hola@barberlab.app"
          className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 transition-colors hover:bg-[oklch(0.98_0.005_80)]"
        >
          <p className="font-serif text-lg font-semibold">Email</p>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            hola@barberlab.app
          </p>
          <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
            Te respondemos en menos de 24 horas.
          </p>
        </a>
      </div>

      <div className="mt-10 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
        <h2 className="font-serif text-lg font-semibold">Horario de atención</h2>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
          Lunes a viernes de 9:00 a 18:00 (hora de Hermosillo).
          Sábados de 10:00 a 14:00.
        </p>
      </div>
    </div>
  );
}
