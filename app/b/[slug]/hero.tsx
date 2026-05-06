import Image from "next/image";
import { MessageCircle, MapPin, Clock } from "lucide-react";
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
    <section
      id="top"
      className="relative flex min-h-[55vh] flex-col justify-end overflow-hidden pt-20 sm:min-h-[60vh]"
    >
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
            background: `radial-gradient(circle at 30% 20%, ${accent}33, transparent 60%), oklch(0.18 0.02 50)`,
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.02_50)] via-[oklch(0.18_0.02_50)]/70 to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          Barbería
        </p>
        <h1 className="mt-2 max-w-3xl break-words font-serif text-3xl font-semibold leading-[1.05] tracking-tight text-[color:var(--paper)] sm:text-5xl md:text-6xl">
          {name}
        </h1>
        {tagline ? (
          <p className="mt-3 max-w-xl text-balance text-sm text-[oklch(0.92_0.02_80)] sm:mt-4 sm:text-base">
            {tagline}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105"
              style={{ background: accent, color: "var(--paper)" }}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          ) : null}
          <a
            href="#servicios"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--paper)]/40 bg-[oklch(0.18_0.02_50)]/50 px-5 py-2.5 text-sm font-semibold text-[color:var(--paper)] backdrop-blur-sm transition-colors hover:bg-[oklch(0.25_0.02_50)]/70"
          >
            Ver servicios
          </a>
          {address ? (
            <a
              href="#ubicacion"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--paper)]/30 px-5 py-2.5 text-sm text-[color:var(--paper)]/90 transition-colors hover:bg-[oklch(0.25_0.02_50)]/40"
            >
              <MapPin className="h-4 w-4" />
              Cómo llegar
            </a>
          ) : null}
        </div>

        {topBarberHours ? (
          <p className="mt-5 inline-flex items-center gap-2 text-xs text-[oklch(0.88_0.02_80)] sm:text-sm">
            <Clock className="h-3.5 w-3.5 opacity-70" />
            <span className="opacity-70">Horarios:</span>{" "}
            {summarizeWorkingHours(topBarberHours)}
          </p>
        ) : null}
      </div>
    </section>
  );
}
