import Image from "next/image";
import { MessageCircle, MapPin } from "lucide-react";
import { summarizeWorkingHours, type WorkingHours } from "@/lib/data/working-hours";

export function Hero({
  name,
  tagline,
  heroImageUrl,
  whatsappUrl,
  address,
  topBarberHours,
  accent,
}: {
  name: string;
  tagline: string | null;
  heroImageUrl: string | null;
  whatsappUrl: string | null;
  address: string | null;
  topBarberHours: WorkingHours | null;
  accent: string;
}) {
  return (
    <section id="top" className="relative flex min-h-screen flex-col justify-end overflow-hidden pt-20">
      {heroImageUrl ? (
        <Image
          src={heroImageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${accent}22, transparent 60%), oklch(0.15 0.01 60)`,
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.1_0.01_60)] via-[oklch(0.15_0.01_60)]/60 to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-16">
        <p
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          Barbería
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          {name}
        </h1>
        {tagline ? (
          <p className="mt-5 max-w-xl text-lg text-[oklch(0.9_0.02_80)] sm:text-xl">
            {tagline}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-transform hover:scale-105"
              style={{ background: accent, color: "oklch(0.15 0.01 60)" }}
            >
              <MessageCircle className="h-5 w-5" />
              Agendar por WhatsApp
            </a>
          ) : null}
          {address ? (
            <a
              href="#ubicacion"
              className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.5_0.02_60)] px-6 py-3 font-semibold transition-colors hover:bg-[oklch(0.25_0.02_60)]"
            >
              <MapPin className="h-5 w-5" />
              Cómo llegar
            </a>
          ) : null}
        </div>

        {topBarberHours ? (
          <p className="mt-8 text-sm text-[oklch(0.85_0.02_80)]">
            <span className="opacity-70">Horarios: </span>
            {summarizeWorkingHours(topBarberHours)}
          </p>
        ) : null}
      </div>
    </section>
  );
}
