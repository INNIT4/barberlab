import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection({ remaining }: { remaining: number }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-[color:var(--foreground)] px-8 py-16 text-[color:var(--background)] sm:px-14 lg:px-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,oklch(0.25_0.02_60)_1px,transparent_0)] [background-size:24px_24px] opacity-40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[oklch(0.55_0.18_25)] opacity-30 blur-3xl"
        />

        <div className="relative grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.85_0.1_25)]">
              {remaining > 0
                ? `Últimos ${remaining} lugares de fundador`
                : "Lugares de fundador agotados"}
            </p>
            <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              {remaining > 0 ? (
                <>
                  Sé una de las primeras{" "}
                  <span className="italic text-[oklch(0.85_0.1_25)]">
                    20 barberías
                  </span>{" "}
                  y guarda el precio de fundador de por vida.
                </>
              ) : (
                "Gracias a las 20 barberías fundadoras. Lista de espera abierta."
              )}
            </h2>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <Button
              asChild
              size="lg"
              className="h-12 bg-[oklch(0.85_0.1_25)] px-7 text-base text-[oklch(0.2_0.03_25)] hover:bg-[oklch(0.88_0.12_25)]"
            >
              <Link href="/signup">
                {remaining > 0 ? "Apartar mi lugar" : "Unirme a la lista de espera"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-[oklch(0.75_0.02_60)]">
              14 días gratis · Cancela cuando quieras
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
