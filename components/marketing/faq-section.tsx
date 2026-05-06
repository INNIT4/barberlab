const FAQS = [
  {
    q: "¿Necesito tarjeta de crédito para la prueba?",
    a: "No. El primer mes es libre. Si al final no convence, simplemente no conectas método de pago y la cuenta se pausa.",
  },
  {
    q: "¿Cobran comisión por cada cita?",
    a: "Nunca. Tu precio mensual es fijo y todo lo que cobres por servicios es 100% tuyo. No somos intermediarios de tus ventas.",
  },
  {
    q: "¿Pueden usarlo varios barberos a la vez?",
    a: "Sí. El plan Pro incluye hasta 5 barberos con agenda separada. Cada uno entra desde su celular y ve solo sus citas.",
  },
  {
    q: "¿Qué pasa si cambio de plan?",
    a: "Puedes subir o bajar de plan cuando quieras desde el panel. El cobro se ajusta al siguiente ciclo.",
  },
  {
    q: "¿Mis clientes necesitan descargar algo?",
    a: "No. Tu página de reservas funciona desde cualquier navegador. Tu cliente abre el link, elige hora y listo.",
  },
  {
    q: "¿Tienen soporte en español?",
    a: "Por supuesto. Te atendemos por WhatsApp, email y en los planes Premium por llamada, en horario laboral CST.",
  },
];

export function FaqSection() {
  return (
    <section
      id="preguntas"
      className="relative bg-[color:var(--paper-deep)]/40"
    >
      <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:py-28">
        <div className="text-center">
          <p className="stamp text-[color:var(--oxblood)]">
            §6 · Preguntas frecuentes
          </p>
          <h2 className="mt-4 font-display text-[2.6rem] leading-[0.95] tracking-tight text-[color:var(--ink)] ink-press sm:text-[3.6rem]">
            ¿Lo que te{" "}
            <span className="italic text-[color:var(--oxblood)]">
              preguntabas
            </span>
            ?
          </h2>
          <div className="mx-auto mt-5 hairline-with-mark max-w-xs">
            <span className="font-display text-base italic text-[color:var(--muted-foreground)]">
              ❦
            </span>
          </div>
        </div>

        <dl className="mt-14 border-t-2 border-double border-[color:var(--ink)]/30">
          {FAQS.map((f, i) => (
            <details
              key={f.q}
              className="group border-b border-[color:var(--ink)]/15 px-1 py-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-sm italic text-[color:var(--oxblood)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <dt className="font-display text-[1.35rem] leading-tight text-[color:var(--ink)]">
                    {f.q}
                  </dt>
                </div>
                <span
                  aria-hidden
                  className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-[color:var(--ink)]/40 text-base font-bold leading-none text-[color:var(--ink)] transition-transform group-open:rotate-45 group-open:bg-[color:var(--oxblood)] group-open:text-[color:var(--paper)] group-open:border-[color:var(--oxblood)]"
                >
                  +
                </span>
              </summary>
              <dd className="mt-3 pl-9 pr-10 font-serif text-[15px] leading-relaxed text-[color:var(--foreground)]/80">
                {f.a}
              </dd>
            </details>
          ))}
        </dl>
      </div>
    </section>
  );
}
