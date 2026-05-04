const STEPS = [
  {
    n: "01",
    title: "Conecta tu barbería",
    body: "Registras barberos, servicios y horarios en 10 minutos. El onboarding te guía paso a paso.",
  },
  {
    n: "02",
    title: "Comparte tu link",
    body: "barberapp.mx/tu-nombre. Lo pegas en tu Instagram, WhatsApp o flyers. Tus clientes agendan solos.",
  },
  {
    n: "03",
    title: "Atiende y cobra",
    body: "Tú ves tu agenda en tiempo real. Marcas citas como completadas. Al final del día ves cuánto facturaste.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-[color:var(--border)] bg-[oklch(0.985_0.008_80)]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
              Cómo funciona
            </p>
            <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              De la libreta al celular{" "}
              <span className="italic">en una tarde</span>.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-[color:var(--muted-foreground)]">
            Diseñado para que tu cliente de 65 años también pueda agendar sin
            batallar.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              className="relative overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-6"
            >
              <span
                aria-hidden
                className="absolute -right-4 -top-6 font-serif text-[140px] font-semibold leading-none text-[oklch(0.95_0.03_80)]"
              >
                {s.n}
              </span>
              <div className="relative">
                <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.18_25)]">
                  Paso {i + 1}
                </span>
                <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
