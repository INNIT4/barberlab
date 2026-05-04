const STATS = [
  { value: "+2,400", label: "citas agendadas en beta" },
  { value: "37%", label: "menos no-shows en promedio" },
  { value: "4.9/5", label: "satisfacción de fundadores" },
  { value: "0%", label: "comisión por cita · siempre" },
];

export function TrustBar() {
  return (
    <section className="relative bg-[color:var(--ink)] text-[color:var(--paper)]">
      {/* Top barber-pole stripe */}
      <div aria-hidden className="h-2 barber-pole opacity-90" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`px-2 py-7 sm:px-5 sm:py-9 ${
                i > 0 ? "sm:border-l sm:border-[color:var(--paper)]/15" : ""
              } ${i === 1 ? "border-l border-[color:var(--paper)]/15 sm:border-l" : ""} ${i === 2 ? "border-t border-[color:var(--paper)]/15 sm:border-t-0" : ""} ${i === 3 ? "border-l border-t border-[color:var(--paper)]/15 sm:border-t-0" : ""}`}
            >
              <p className="font-display text-3xl leading-none tracking-tight text-[color:var(--paper)] sm:text-[2.6rem]">
                {s.value}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--paper)]/70 sm:text-[11px]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom barber-pole stripe (reversed direction by mirroring) */}
      <div aria-hidden className="h-2 barber-pole opacity-90 [transform:scaleX(-1)]" />
    </section>
  );
}
