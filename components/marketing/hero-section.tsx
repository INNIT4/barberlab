import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { HeroPreview } from "./hero-preview";

const PROMISES = [
  { k: "I.", v: "14 días gratis · sin tarjeta" },
  { k: "II.", v: "Cero comisión por cita" },
  { k: "III.", v: "Listo en una tarde" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative background — soft brass wash + halftone */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] bg-[radial-gradient(ellipse_60%_70%_at_30%_10%,oklch(0.92_0.06_75)_0%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-32 -z-10 h-[420px] text-[color:var(--oxblood)] halftone [mask-image:radial-gradient(ellipse_at_top_right,black_0%,transparent_60%)]"
      />

      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-16 lg:pt-20 lg:pb-24">
        {/* Masthead row */}
        <div className="hairline-with-mark mb-10">
          <span className="font-display text-xs italic text-[color:var(--muted-foreground)]">
            ❦ La Gaceta del Barbero ❦
          </span>
        </div>

        <div className="grid items-end gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div className="relative">
            <span className="inline-flex items-center gap-2 border border-[color:var(--ink)]/70 bg-[color:var(--paper)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--ink)] shadow-[2px_2px_0_var(--oxblood)]">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--oxblood)]" />
              Estreno · Beta para barberos fundadores
            </span>

            <h1 className="mt-7 font-display text-[3.4rem] leading-[0.92] tracking-[-0.02em] text-[color:var(--ink)] ink-press sm:text-[4.6rem] lg:text-[5.5rem]">
              Tu barbería,
              <br />
              <span className="italic text-[color:var(--oxblood)]">
                sin citas
              </span>{" "}
              <span className="relative inline-block">
                perdidas
                <svg
                  aria-hidden
                  viewBox="0 0 220 16"
                  className="absolute -bottom-2 left-0 h-3 w-full text-[color:var(--brass-deep)]"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 12 Q 55 2, 110 8 T 218 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>

            <p className="mt-7 max-w-xl font-serif text-lg leading-relaxed text-[color:var(--foreground)]/85">
              La agenda que tus clientes abren desde WhatsApp y que cobra
              puntual, aunque tú estés con la máquina en la mano.{" "}
              <span className="italic">Hecha en México, en pesos</span>, sin
              comisiones por cita.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 bg-[color:var(--ink)] px-7 text-[0.85rem] uppercase tracking-[0.18em] text-[color:var(--paper)] shadow-[3px_3px_0_var(--oxblood)] transition-transform hover:-translate-y-0.5 hover:bg-[color:var(--oxblood)] hover:shadow-[5px_5px_0_var(--ink)]"
              >
                <Link href="/signup">
                  Probar 14 días gratis
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-[color:var(--ink)]/70 bg-transparent px-6 text-[0.85rem] uppercase tracking-[0.18em] text-[color:var(--ink)] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
              >
                <Link href="/precios">Leer precios</Link>
              </Button>
            </div>

            <ul className="mt-10 grid max-w-md grid-cols-1 gap-y-2 sm:grid-cols-3 sm:gap-x-3">
              {PROMISES.map((p) => (
                <li
                  key={p.v}
                  className="flex items-baseline gap-1.5 text-[11px] leading-tight text-[color:var(--muted-foreground)]"
                >
                  <span className="font-display text-[color:var(--oxblood)]">
                    {p.k}
                  </span>
                  <span className="uppercase tracking-[0.08em]">{p.v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            {/* Pinned tape on the preview */}
            <div className="pinned">
              <HeroPreview />
            </div>
            {/* Decorative price stamp */}
            <div className="absolute -right-4 -top-6 hidden rotate-12 sm:block">
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-dashed border-[color:var(--oxblood)] bg-[color:var(--paper)] text-center text-[color:var(--oxblood)] shadow-[0_4px_18px_oklch(0.18_0.02_50/0.18)]">
                <span className="font-display text-3xl leading-none">14</span>
                <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.15em]">
                  Días gratis
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom rule with newspaper marks */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between border-t border-[color:var(--ink)]/70 pt-3">
          <span className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
            §1 · Lo que ofrecemos
          </span>
          <span className="font-display text-xs italic text-[color:var(--muted-foreground)]">
            sigue leyendo ↓
          </span>
        </div>
      </div>
    </section>
  );
}
