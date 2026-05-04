import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { HeroPreview } from "./hero-preview";

const BULLET_POINTS = [
  "14 días gratis, sin tarjeta",
  "Sin comisiones por cita",
  "Configuración guiada en 10 minutos",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(ellipse_at_top,oklch(0.95_0.04_80)_0%,transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_1px_1px,oklch(0.85_0.01_80)_1px,transparent_0)] [background-size:28px_28px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]"
      />

      <div className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1 text-xs font-medium text-[color:var(--muted-foreground)] shadow-sm">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.55_0.18_25)]" />
              Nuevo en México · Beta para barberos fundadores
            </span>

            <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.02] tracking-tight text-[color:var(--foreground)] sm:text-6xl lg:text-[72px]">
              Tu barbería,{" "}
              <span className="italic text-[oklch(0.45_0.15_25)]">
                sin citas
              </span>{" "}
              perdidas.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[color:var(--muted-foreground)]">
              La agenda que tus clientes abren desde WhatsApp y que cobra
              puntual, aunque tú estés con la máquina en la mano. Hecho en
              México, en pesos, sin comisiones por cita.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 px-6 text-base shadow-md">
                <Link href="/signup">
                  Probar 14 días gratis
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base"
              >
                <Link href="/precios">Ver planes</Link>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {BULLET_POINTS.map((b) => (
                <li
                  key={b}
                  className="inline-flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]"
                >
                  <Check className="h-4 w-4 text-[oklch(0.55_0.14_150)]" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <HeroPreview />
        </div>
      </div>
    </section>
  );
}
