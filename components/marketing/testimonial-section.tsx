import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Antes llevaba mis citas en una libreta y cada domingo me peleaba con WhatsApp. Ahora mis clientes se apartan solos y yo solo corto.",
    name: "Tony Méndez",
    role: "Tony Barber Shop · Hermosillo",
  },
  {
    quote:
      "Los recordatorios bajaron los no-shows como 40%. Ese solo cambio ya pagó la suscripción tres veces.",
    name: "Memo Ruiz",
    role: "Atelier Barber · Ciudad Obregón",
  },
  {
    quote:
      "Metí a mis tres barberos y cada quien ve su agenda desde su celular. Se acabaron los choques de citas.",
    name: "Carlos Valenzuela",
    role: "La Navaja · Nogales",
  },
];

export function TestimonialSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.45_0.15_25)]">
          Lo que dicen los fundadores
        </p>
        <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Construido mano a mano con{" "}
          <span className="italic">barberos reales</span>.
        </h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="relative flex flex-col gap-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-7"
          >
            <Quote
              className="h-7 w-7 text-[oklch(0.85_0.1_25)]"
              strokeWidth={1.6}
            />
            <blockquote className="font-serif text-lg leading-snug">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3 border-t border-[color:var(--border)] pt-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.9_0.04_80)] font-serif text-sm font-semibold text-[oklch(0.35_0.1_60)]">
                {t.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-[color:var(--muted-foreground)]">
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
