import { MessageCircle } from "lucide-react";
import type { Barber } from "@/lib/db/schema";
import {
  summarizeWorkingHours,
  type WorkingHours,
} from "@/lib/data/working-hours";

type BarberLite = Pick<
  Barber,
  "id" | "name" | "role" | "avatarTone" | "workingHours"
>;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function TeamSection({
  team,
  whatsappUrl,
  accent,
}: {
  team: BarberLite[];
  whatsappUrl: string | null;
  accent: string;
}) {
  if (team.length === 0) return null;

  return (
    <section id="equipo" className="border-t border-[oklch(0.25_0.02_60)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-12 max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            El equipo
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Nuestros barberos
          </h2>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((b) => {
            const bookUrl = whatsappUrl
              ? `${whatsappUrl.split("?")[0]}?text=${encodeURIComponent(`Hola, quisiera agendar con ${b.name}`)}`
              : null;
            return (
              <article
                key={b.id}
                className="overflow-hidden rounded-2xl border border-[oklch(0.25_0.02_60)] bg-[oklch(0.18_0.01_60)] p-6 transition-colors hover:border-[oklch(0.4_0.05_60)]"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full font-serif text-xl font-semibold"
                    style={{
                      background: b.avatarTone,
                      color: "oklch(0.2 0.02 60)",
                    }}
                  >
                    {initials(b.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-xl font-semibold">
                      {b.name}
                    </h3>
                    <p className="text-xs uppercase tracking-wider text-[oklch(0.7_0.04_60)]">
                      {b.role}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-xs text-[oklch(0.8_0.02_80)]">
                  {summarizeWorkingHours(b.workingHours as WorkingHours | null)}
                </p>

                {bookUrl ? (
                  <a
                    href={bookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[oklch(0.35_0.03_60)] py-2 text-sm font-medium transition-colors hover:bg-[oklch(0.25_0.02_60)]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Agendar con {b.name.split(/\s+/)[0]}
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
