const FAQS = [
  {
    q: "¿Necesito tarjeta de crédito para la prueba?",
    a: "No. Los 14 días son libres. Si al final no convence, simplemente no conectas método de pago y la cuenta se pausa.",
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
      className="border-t border-[color:var(--border)] bg-[oklch(0.985_0.008_80)]"
    >
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
            Preguntas frecuentes
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            ¿Lo que te preguntabas?
          </h2>
        </div>

        <dl className="mt-12 divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                <dt className="font-serif text-lg font-semibold leading-snug">
                  {f.q}
                </dt>
                <span
                  aria-hidden
                  className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-[color:var(--border)] text-lg leading-none text-[color:var(--muted-foreground)] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <dd className="mt-3 pr-10 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                {f.a}
              </dd>
            </details>
          ))}
        </dl>
      </div>
    </section>
  );
}
