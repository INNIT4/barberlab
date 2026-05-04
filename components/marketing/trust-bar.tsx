const STATS = [
  { value: "+2,400", label: "citas agendadas en beta" },
  { value: "37%", label: "menos no-shows en promedio" },
  { value: "4.9/5", label: "satisfacción de barberos fundadores" },
  { value: "0%", label: "comisión por cita. Siempre." },
];

export function TrustBar() {
  return (
    <section className="border-y border-[color:var(--border)] bg-[color:var(--card)]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-[color:var(--border)] px-4 sm:grid-cols-4 sm:px-6">
        {STATS.map((s) => (
          <div key={s.label} className="px-4 py-6 sm:px-6 sm:py-8">
            <p className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-xs leading-snug text-[color:var(--muted-foreground)] sm:text-sm">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
