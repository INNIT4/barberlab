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
  amber: "bg-[oklch(0.95_0.07_80)] text-[oklch(0.35_0.1_60)] ring-[oklch(0.85_0.08_80)]",
  emerald: "bg-[oklch(0.95_0.05_155)] text-[oklch(0.38_0.1_150)] ring-[oklch(0.85_0.06_155)]",
  rose: "bg-[oklch(0.95_0.05_20)] text-[oklch(0.45_0.15_25)] ring-[oklch(0.88_0.06_20)]",
  slate: "bg-[oklch(0.96_0.005_80)] text-[oklch(0.35_0.01_80)] ring-[oklch(0.9_0.005_80)]",
};

export function HeroPreview() {
  return (
    <div className="relative isolate">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-[oklch(0.95_0.04_80)] to-[oklch(0.9_0.06_25)] blur-2xl opacity-70"
      />

      <div className="rotate-[0.5deg] rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-[0_20px_60px_-20px_rgba(60,40,20,0.35)] ring-1 ring-black/5 sm:p-5">
        <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.8_0.12_25)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.85_0.1_80)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.8_0.12_155)]" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[color:var(--muted-foreground)]">
            <Calendar className="h-3.5 w-3.5" />
            Viernes 3 de mayo
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <Stat label="Citas hoy" value="14" accent="slate" />
          <Stat label="Ingresos" value="$3,240" accent="emerald" />
          <Stat label="No-shows" value="0" accent="rose" />
        </div>

        <ol className="mt-5 space-y-2">
          {APPOINTMENTS.map((a) => (
            <li
              key={a.time}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ring-1 ${TONE_MAP[a.tone]}`}
            >
              <span className="font-mono text-sm font-semibold tabular-nums">
                {a.time}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[color:var(--foreground)]">
                  {a.customer}
                </p>
                <p className="truncate text-[11px] opacity-80">
                  <Scissors className="mr-1 inline h-3 w-3" />
                  {a.service}
                </p>
              </div>
              <div className="text-right text-[11px]">
                <p className="inline-flex items-center gap-1 font-medium">
                  <User2 className="h-3 w-3" />
                  {a.barber}
                </p>
                <p className="opacity-70">{a.duration}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="absolute -bottom-6 -left-6 hidden w-56 rotate-[-3deg] rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-3 text-xs shadow-xl sm:block">
        <p className="font-serif text-sm font-semibold">Nueva reseña</p>
        <p className="mt-1 text-[11px] leading-relaxed text-[color:var(--muted-foreground)]">
          &ldquo;Agendar con Tony nunca había sido tan fácil. Llegué, me senté y
          listo.&rdquo;
        </p>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.55_0.18_25)]">
          ★★★★★ · Luis H.
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "slate" | "emerald" | "rose";
}) {
  const color =
    accent === "emerald"
      ? "text-[oklch(0.45_0.15_150)]"
      : accent === "rose"
      ? "text-[oklch(0.5_0.15_25)]"
      : "text-[color:var(--foreground)]";
  return (
    <div className="rounded-lg bg-[oklch(0.98_0.004_80)] p-3 ring-1 ring-[color:var(--border)]">
      <p className="text-[10px] font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">
        {label}
      </p>
      <p className={`mt-0.5 font-serif text-xl font-semibold ${color}`}>
        {value}
      </p>
    </div>
  );
}
