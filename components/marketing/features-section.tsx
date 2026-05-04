import {
  Calendar,
  Users,
  MessageCircle,
  BarChart3,
  Globe,
  Lock,
} from "lucide-react";

const FEATURES = [
  {
    icon: Calendar,
    title: "Agenda que nunca se empalma",
    body: "Vista semanal tipo Google Calendar, pero pensada para barberos. Bloqueas descansos, marcas no-shows y arrastras citas para moverlas.",
  },
  {
    icon: Globe,
    title: "Tu propia página de reservas",
    body: "barberapp.mx/tu-nombre. Compártela en Instagram y WhatsApp. Tus clientes agendan 24/7 sin descargar nada.",
  },
  {
    icon: Users,
    title: "Historial de cada cliente",
    body: "Qué corte quiso Luis el mes pasado, qué le gustó, cuándo va a regresar. Trato personalizado sin dependerte de tu memoria.",
  },
  {
    icon: BarChart3,
    title: "Números que sí entiendes",
    body: "Ingresos del día, de la semana, cuántos clientes son nuevos y cuántos regresan. Sin dashboards confusos.",
  },
  {
    icon: MessageCircle,
    title: "Recordatorios que reducen faltas",
    body: "Avisos automáticos de la cita por email (y WhatsApp próximamente). Menos no-shows, más ingresos.",
  },
  {
    icon: Lock,
    title: "Sin comisiones por cita",
    body: "Fresha te cobra por cada reserva online. Aquí pagas un precio fijo al mes. Lo que cobras es tuyo.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="caracteristicas"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.45_0.15_25)]">
          Todo en un solo lugar
        </p>
        <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Pensado para barberos{" "}
          <span className="italic">que cortan pelo</span>, no para contadores.
        </h2>
        <p className="mt-4 text-lg text-[color:var(--muted-foreground)]">
          Cada función nace de preguntar a barberos reales qué les duele. No hay
          feature de más.
        </p>
      </div>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--border)] md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className="group relative flex flex-col gap-3 bg-[color:var(--card)] p-7 transition-colors hover:bg-[oklch(0.985_0.005_80)]"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.97_0.03_25)] text-[oklch(0.45_0.15_25)] ring-1 ring-[oklch(0.9_0.04_25)]">
              <f.icon className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <h3 className="font-serif text-xl font-semibold leading-tight">
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              {f.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
