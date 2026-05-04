import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection({ remaining }: { remaining: number }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
      <div className="relative overflow-hidden border-2 border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)] shadow-[10px_12px_0_var(--oxblood)]">
        {/* Top barber-pole stripe */}
        <div aria-hidden className="h-2 barber-pole opacity-95" />

        {/* Halftone */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 text-[color:var(--paper)] halftone [mask-image:radial-gradient(ellipse_at_top_right,black_0%,transparent_60%)]"
        />

        <div className="relative px-7 py-14 sm:px-12 lg:px-16 lg:py-20">
          {/* Top stamp row */}
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--paper)]/20 pb-4">
            <p className="stamp text-[color:var(--brass)]">
              ❦ Última llamada · Edición fundadores
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--paper)]/60">
              MMXXVI · Sonora, MX
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <p className="stamp text-[color:var(--brass)]">
                {remaining > 0
                  ? `Quedan ${remaining} lugares`
                  : "Lugares de fundador agotados"}
              </p>
              <h2 className="mt-4 font-display text-[2.6rem] leading-[0.95] tracking-tight sm:text-[3.6rem] lg:text-[4.6rem]">
                {remaining > 0 ? (
                  <>
                    Sé una de las primeras
                    <br />
                    <span className="italic text-[color:var(--brass)]">
                      20 barberías
                    </span>
                    .
                  </>
                ) : (
                  <>
                    Gracias a las{" "}
                    <span className="italic text-[color:var(--brass)]">
                      20 fundadoras
                    </span>
                    . Lista de espera abierta.
                  </>
                )}
              </h2>
              <p className="mt-5 max-w-md font-serif text-[17px] italic leading-relaxed text-[color:var(--paper)]/75">
                Guarda el precio de fundador
                <span className="font-bold not-italic"> de por vida</span> y
                recibe onboarding 1:1 con el equipo que está construyendo esto
                contigo.
              </p>
            </div>

            <div className="flex flex-col gap-4 md:items-end">
              <Button
                asChild
                size="lg"
                className="h-13 bg-[color:var(--brass)] px-7 py-3.5 text-[0.85rem] uppercase tracking-[0.18em] text-[color:var(--ink)] shadow-[4px_4px_0_var(--paper)] transition-transform hover:-translate-y-0.5 hover:bg-[color:var(--paper)] hover:shadow-[6px_6px_0_var(--brass)]"
              >
                <Link href="/signup">
                  {remaining > 0 ? "Apartar mi lugar" : "Unirme a la lista"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--paper)]/55">
                14 días gratis · Cancela cuando quieras
              </p>
            </div>
          </div>
        </div>

        {/* Bottom barber-pole stripe */}
        <div aria-hidden className="h-2 barber-pole opacity-95 [transform:scaleX(-1)]" />
      </div>
    </section>
  );
}
