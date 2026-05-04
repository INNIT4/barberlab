import { Calendar, Scissors, User2 } from "lucide-react";

type Appointment = {
  time: string;
  customer: string;
  service: string;
  barber: string;
  duration: string;
  tone: "amber" | "emerald" | "rose" | "slate";
};

const APPOINTMENTS: Appointment[] = [
  { time: "09:30", customer: "Luis Herrera", service: "Corte clásico + barba", barber: "Tony", duration: "45 min", tone: "amber" },
  { time: "10:15", customer: "Daniel Ruiz", service: "Fade americano", barber: "Tony", duration: "30 min", tone: "emerald" },
  { time: "11:00", customer: "Mario Castro", service: "Diseño + barba", barber: "Memo", duration: "60 min", tone: "rose" },
  { time: "12:00", customer: "Andrés Vega", service: "Corte niño", barber: "Memo", duration: "25 min", tone: "slate" },
];

const TONE_MAP: Record<Appointment["tone"], string> = {
  amber: "border-l-[color:var(--brass-deep)] bg-[oklch(0.96_0.05_85)]",
  emerald: "border-l-[oklch(0.5_0.12_150)] bg-[oklch(0.96_0.04_150)]",
  rose: "border-l-[color:var(--oxblood)] bg-[oklch(0.95_0.05_25)]",
  slate: "border-l-[color:var(--ink)]/60 bg-[oklch(0.95_0.01_60)]",
};

export function HeroPreview() {
  return (
    <div className="relative isolate">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-[oklch(0.94_0.05_75)] to-[oklch(0.88_0.06_30)] blur-2xl opacity-60"
      />

      {/* The "clipping" — newspaper-style framed schedule */}
      <div className="rotate-[-1deg] border-2 border-[color:var(--ink)]/85 bg-[color:var(--paper)] p-4 shadow-[6px_8px_0_var(--ink),0_22px_60px_-20px_oklch(0.18_0.02_50/0.45)] sm:p-5">
        {/* Masthead inside the clipping */}
        <div className="flex items-end justify-between border-b-2 border-[color:var(--ink)] pb-2">
          <div>
            <p className="font-display text-base leading-none text-[color:var(--ink)]">
              Agenda del día
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
              Tony Barber Shop · Hermosillo
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--ink)]">
            <Calendar className="h-3 w-3" />
            Vie · 03 May
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <Stat label="Citas hoy" value="14" />
          <Stat label="Ingresos" value="$3,240" highlight />
          <Stat label="No-shows" value="0" />
        </div>

        <ol className="mt-3 space-y-1.5">
          {APPOINTMENTS.map((a) => (
            <li
              key={a.time}
              className={`flex items-center gap-3 rounded-sm border-l-[3px] px-3 py-2 ring-1 ring-[color:var(--ink)]/10 ${TONE_MAP[a.tone]}`}
            >
              <span className="font-display text-base leading-none tabular-nums text-[color:var(--ink)]">
                {a.time}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[color:var(--ink)]">
                  {a.customer}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-[color:var(--ink)]/70">
                  <Scissors className="mr-1 inline h-2.5 w-2.5" />
                  {a.service}
                </p>
              </div>
              <div className="text-right text-[10px] text-[color:var(--ink)]/80">
                <p className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider">
                  <User2 className="h-2.5 w-2.5" />
                  {a.barber}
                </p>
                <p className="opacity-70">{a.duration}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-3 border-t border-dashed border-[color:var(--ink)]/30 pt-2 text-center text-[9px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
          ❦ Recortado de la edición de hoy ❦
        </p>
      </div>

      {/* Pinned review note */}
      <div className="absolute -bottom-7 -left-8 hidden w-60 rotate-[-4deg] border border-[color:var(--ink)]/40 bg-[oklch(0.92_0.06_85)] p-3 text-xs shadow-[3px_5px_0_oklch(0.18_0.02_50/0.25)] sm:block">
        <div className="flex items-center justify-between border-b border-dashed border-[color:var(--ink)]/30 pb-1.5">
          <p className="font-display text-sm text-[color:var(--ink)]">
            Reseña reciente
          </p>
          <p className="text-[10px] tracking-wider text-[color:var(--oxblood)]">
            ★★★★★
          </p>
        </div>
        <p className="mt-2 font-serif text-[11px] italic leading-snug text-[color:var(--ink)]/80">
          &ldquo;Agendar con Tony nunca había sido tan fácil. Llegué, me senté
          y listo.&rdquo;
        </p>
        <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-[color:var(--ink)]/60">
          — Luis H.
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="border border-[color:var(--ink)]/15 bg-[color:var(--paper)] px-2 py-2">
      <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
        {label}
      </p>
      <p
        className={`mt-0.5 font-display text-xl leading-none ${
          highlight
            ? "text-[color:var(--oxblood)]"
            : "text-[color:var(--ink)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
