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
    <section
      id="equipo"
      className="border-t border-[color:var(--ink)]/10 bg-[color:var(--paper-deep)]/30 py-16 text-[color:var(--ink)] sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-10 max-w-2xl">
          <p className="stamp" style={{ color: accent }}>
            El equipo
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Nuestros barberos
          </h2>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((b) => {
            const bookUrl = whatsappUrl
              ? `${whatsappUrl.split("?")[0]}?text=${encodeURIComponent(`Hola, quisiera agendar con ${b.name}`)}`
              : null;
            return (
              <article
                key={b.id}
                className="overflow-hidden rounded-2xl border border-[color:var(--ink)]/10 bg-[color:var(--card)] p-5 shadow-sm transition hover:border-[color:var(--ink)]/30"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full font-serif text-lg font-semibold"
                    style={{
                      background: b.avatarTone,
                      color: "var(--paper)",
                    }}
                  >
                    {initials(b.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-lg font-semibold">
                      {b.name}
                    </h3>
                    <p className="text-[10px] uppercase tracking-wider text-[color:var(--muted-foreground)]">
                      {b.role}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs text-[color:var(--ink)]/70">
                  {summarizeWorkingHours(b.workingHours as WorkingHours | null)}
                </p>

                {bookUrl ? (
                  <a
                    href={bookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[color:var(--ink)]/20 py-2 text-sm font-medium transition-colors hover:bg-[color:var(--ink)]/5"
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
