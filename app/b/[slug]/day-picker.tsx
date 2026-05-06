"use client";

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];
const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export type Day = {
  /** ISO local: YYYY-MM-DD */
  iso: string;
  available: boolean;
};

export function DayPicker({
  days,
  selectedIso,
  onSelect,
  accent,
}: {
  days: Day[];
  selectedIso: string;
  onSelect: (iso: string) => void;
  accent: string;
}) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
      {days.map((d) => {
        const [y, m, day] = d.iso.split("-").map(Number);
        const date = new Date(Date.UTC(y, m - 1, day));
        const wd = WEEKDAYS[date.getUTCDay()];
        const monthLabel = MONTHS[date.getUTCMonth()];
        const isSelected = d.iso === selectedIso;

        return (
          <button
            key={d.iso}
            type="button"
            onClick={() => onSelect(d.iso)}
            disabled={!d.available}
            className={`flex min-w-[68px] flex-col items-center gap-1 rounded-xl border px-3 py-2 text-center transition ${
              isSelected
                ? "border-transparent text-[color:var(--paper)] shadow-sm"
                : d.available
                  ? "border-[color:var(--ink)]/15 hover:border-[color:var(--ink)]/40"
                  : "cursor-not-allowed border-[color:var(--ink)]/10 opacity-40"
            }`}
            style={
              isSelected
                ? { background: accent, borderColor: accent }
                : undefined
            }
            aria-pressed={isSelected}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
              {wd}
            </span>
            <span className="font-serif text-xl font-semibold leading-none">
              {day}
            </span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">
              {monthLabel}
            </span>
            <span
              className={`mt-1 h-1.5 w-1.5 rounded-full ${
                isSelected
                  ? "bg-[color:var(--paper)]/80"
                  : d.available
                    ? "bg-[oklch(0.65_0.18_145)]"
                    : "bg-[color:var(--ink)]/20"
              }`}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
