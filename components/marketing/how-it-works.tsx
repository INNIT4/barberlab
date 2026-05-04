const STEPS = [
  {
    n: "01",
    title: "Conecta tu barbería",
    body: "Registras barberos, servicios y horarios en 10 minutos. El onboarding te guía paso a paso.",
    pull: "10 min",
  },
  {
    n: "02",
    title: "Comparte tu link",
    body: "barberapp.mx/tu-nombre. Lo pegas en tu Instagram, WhatsApp o flyers. Tus clientes agendan solos.",
    pull: "24/7",
  },
  {
    n: "03",
    title: "Atiende y cobra",
    body: "Tú ves tu agenda en tiempo real. Marcas citas como completadas. Al final del día ves cuánto facturaste.",
    pull: "$$$",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--ink)] text-[color:var(--paper)]">
      {/* Brass top stripe */}
      <div aria-hidden className="h-1.5 bg-[color:var(--brass-deep)]" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 text-[color:var(--paper)] halftone [mask-image:radial-gradient(ellipse_at_top_left,black_0%,transparent_55%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="stamp text-[color:var(--brass)]">
              §3 · Cómo funciona
            </p>
            <h2 className="mt-4 font-display text-[2.6rem] leading-[0.95] tracking-tight sm:text-[3.6rem] lg:text-[4.4rem]">
              De la libreta al celular
              <br />
              <span className="italic text-[color:var(--brass)]">
                en una tarde
              </span>
              .
            </h2>
          </div>
          <p className="max-w-sm font-serif text-base italic text-[color:var(--paper)]/70 md:text-right">
            Diseñado para que tu cliente de 65 años también pueda agendar sin
            batallar.
          </p>
        </div>

        <ol className="mt-16 grid gap-px bg-[color:var(--paper)]/10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              className="group relative overflow-hidden bg-[color:var(--ink)] p-8 transition-colors hover:bg-[oklch(0.2_0.025_50)] lg:p-10"
            >
              {/* Huge background numeral */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[12rem] leading-none text-[color:var(--paper)]/[0.06] sm:text-[14rem]"
              >
                {s.n}
              </span>

              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl italic text-[color:var(--brass)]">
                    {s.n}
                  </span>
                  <span className="inline-flex items-center justify-center rounded-full border border-[color:var(--brass)]/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--brass)]">
                    {s.pull}
                  </span>
                </div>

                <div className="mt-8 h-px w-12 bg-[color:var(--brass)]" />

                <h3 className="mt-5 font-display text-[1.85rem] leading-[1.05] text-[color:var(--paper)]">
                  {s.title}
                </h3>
                <p className="mt-3 font-serif text-[15px] leading-relaxed text-[color:var(--paper)]/75">
                  {s.body}
                </p>
                <span className="mt-8 text-[10px] uppercase tracking-[0.22em] text-[color:var(--paper)]/40">
                  Paso {i + 1} de {STEPS.length}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Brass bottom stripe */}
      <div aria-hidden className="h-1.5 bg-[color:var(--brass-deep)]" />
    </section>
  );
}
