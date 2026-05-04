const TESTIMONIALS = [
  {
    quote:
      "Antes llevaba mis citas en una libreta y cada domingo me peleaba con WhatsApp. Ahora mis clientes se apartan solos y yo solo corto.",
    name: "Tony Méndez",
    role: "Tony Barber Shop · Hermosillo",
    initials: "TM",
  },
  {
    quote:
      "Los recordatorios bajaron los no-shows como 40%. Ese solo cambio ya pagó la suscripción tres veces.",
    name: "Memo Ruiz",
    role: "Atelier Barber · Cd. Obregón",
    initials: "MR",
  },
  {
    quote:
      "Metí a mis tres barberos y cada quien ve su agenda desde su celular. Se acabaron los choques de citas.",
    name: "Carlos Valenzuela",
    role: "La Navaja · Nogales",
    initials: "CV",
  },
];

export function TestimonialSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
      <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
        <div className="max-w-2xl">
          <p className="stamp text-[color:var(--oxblood)]">
            §5 · Lo que dicen los fundadores
          </p>
          <h2 className="mt-4 font-display text-[2.6rem] leading-[0.95] tracking-tight text-[color:var(--ink)] ink-press sm:text-[3.6rem] lg:text-[4.2rem]">
            Construido mano a mano
            <br />
            con{" "}
            <span className="italic text-[color:var(--oxblood)]">
              barberos reales
            </span>
            .
          </h2>
        </div>
        <p className="font-serif text-base italic text-[color:var(--foreground)]/75 md:text-right">
          Cada palabra de aquí abajo proviene de una llamada de viernes por la
          tarde, no de un focus group.
        </p>
      </div>

      <div className="mt-16 grid gap-7 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={t.name}
            className={`group relative flex flex-col gap-5 border border-[color:var(--ink)]/25 bg-[color:var(--paper)] p-7 shadow-[4px_5px_0_oklch(0.18_0.02_50/0.12)] transition-transform hover:-translate-y-1 ${
              i === 1 ? "md:rotate-[0.4deg]" : i === 2 ? "md:-rotate-[0.4deg]" : ""
            }`}
          >
            {/* Big editorial quote */}
            <span
              aria-hidden
              className="absolute -top-4 left-5 select-none font-display text-7xl leading-none text-[color:var(--oxblood)]"
            >
              &ldquo;
            </span>

            <blockquote className="mt-3 font-display text-[1.45rem] leading-[1.15] text-[color:var(--ink)]">
              {t.quote}
            </blockquote>

            <div
              aria-hidden
              className="border-t border-dashed border-[color:var(--ink)]/30"
            />

            <figcaption className="mt-auto flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--ink)] font-display text-sm text-[color:var(--paper)] ring-2 ring-[color:var(--brass)] ring-offset-2 ring-offset-[color:var(--paper)]">
                {t.initials}
              </span>
              <div>
                <p className="font-display text-base leading-none text-[color:var(--ink)]">
                  {t.name}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                  {t.role}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
