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
    n: "I",
    icon: Calendar,
    title: "Agenda que nunca se empalma",
    body: "Vista semanal tipo Google Calendar, pensada para barberos. Bloqueas descansos, marcas no-shows y arrastras citas para moverlas.",
  },
  {
    n: "II",
    icon: Globe,
    title: "Tu propia página de reservas",
    body: "barberlab.app/tu-nombre. Compártela en Instagram y WhatsApp. Tus clientes agendan 24/7 sin descargar nada.",
  },
  {
    n: "III",
    icon: Users,
    title: "Historial de cada cliente",
    body: "Qué corte quiso Luis el mes pasado, qué le gustó, cuándo va a regresar. Trato personalizado sin depender de tu memoria.",
  },
  {
    n: "IV",
    icon: BarChart3,
    title: "Números que sí entiendes",
    body: "Ingresos del día, de la semana, cuántos clientes son nuevos y cuántos regresan. Sin dashboards confusos.",
  },
  {
    n: "V",
    icon: MessageCircle,
    title: "Recordatorios que reducen faltas",
    body: "Avisos automáticos por email — y pronto WhatsApp. Menos no-shows, más ingresos, menos llamadas perdidas.",
  },
  {
    n: "VI",
    icon: Lock,
    title: "Sin comisiones por cita",
    body: "Fresha te cobra por cada reserva online. Aquí pagas un precio fijo al mes. Lo que cobras es tuyo.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="caracteristicas"
      className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32"
    >
      {/* Section masthead */}
      <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
        <div>
          <p className="stamp text-[color:var(--oxblood)]">
            §2 · Todo en un solo lugar
          </p>
          <h2 className="mt-4 font-display text-[2.6rem] leading-[0.95] tracking-tight text-[color:var(--ink)] ink-press sm:text-[3.6rem] lg:text-[4.2rem]">
            Pensado para los barberos
            <br />
            <span className="italic text-[color:var(--oxblood)]">
              que cortan pelo
            </span>
            ,{" "}
            <span className="text-[color:var(--ink)]/60">
              no para contadores
            </span>
            .
          </h2>
        </div>
        <p className="font-serif text-lg leading-relaxed text-[color:var(--foreground)]/85 md:max-w-sm md:justify-self-end md:text-right">
          Cada función nace de preguntar a barberos reales qué les duele.
          <span className="italic"> No hay feature de más.</span>
        </p>
      </div>

      {/* Decorative double rule */}
      <div className="mt-12 border-t-2 border-double border-[color:var(--ink)]/30" />

      {/* Magazine-column grid: hairlines instead of cards */}
      <div className="grid divide-y divide-[color:var(--ink)]/15 md:grid-cols-2 md:divide-y-0 md:[&>*:nth-child(odd)]:border-r md:[&>*:nth-child(odd)]:border-[color:var(--ink)]/15 lg:grid-cols-3 lg:divide-y-0 lg:[&>*:nth-child(odd)]:border-r-0 lg:[&>*]:border-r lg:[&>*]:border-[color:var(--ink)]/15 lg:[&>*:nth-child(3n)]:border-r-0">
        {FEATURES.map((f, i) => (
          <article
            key={f.title}
            className={`group relative flex flex-col gap-3 p-7 transition-colors hover:bg-[color:var(--paper-deep)]/40 lg:p-9 ${
              i >= 3 ? "lg:border-t lg:border-[color:var(--ink)]/15" : ""
            } ${i >= 2 && i < 4 ? "md:[&]:!border-[color:var(--ink)]/15" : ""}`}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl italic text-[color:var(--oxblood)]">
                {f.n}.
              </span>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--ink)]/30 bg-[color:var(--paper)] text-[color:var(--ink)] shadow-[2px_2px_0_var(--brass)]">
                <f.icon className="h-4 w-4" strokeWidth={1.7} />
              </div>
            </div>
            <h3 className="mt-2 font-display text-[1.6rem] leading-[1.05] text-[color:var(--ink)]">
              {f.title}
            </h3>
            <p className="font-serif text-[15px] leading-relaxed text-[color:var(--foreground)]/80">
              {f.body}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-12 border-t-2 border-double border-[color:var(--ink)]/30" />
    </section>
  );
}
