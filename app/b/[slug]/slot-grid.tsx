"use client";

export function SlotGrid({
  slots,
  selectedTime,
  onSelect,
  accent,
  loading,
}: {
  slots: string[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  accent: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-lg bg-[color:var(--ink)]/8"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--ink)]/20 px-4 py-8 text-center">
        <p className="font-serif text-base text-[color:var(--ink)]/70">
          Sin horarios disponibles este día.
        </p>
        <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
          Prueba con otra fecha o barbero.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((time) => {
        const isSelected = time === selectedTime;
        return (
          <button
            key={time}
            type="button"
            onClick={() => onSelect(time)}
            className={`rounded-lg border py-2 text-sm font-medium tabular-nums transition ${
              isSelected
                ? "border-transparent text-[color:var(--paper)] shadow-sm"
                : "border-[color:var(--ink)]/15 hover:border-[color:var(--ink)]/40 hover:bg-[color:var(--ink)]/5"
            }`}
            style={isSelected ? { background: accent } : undefined}
            aria-pressed={isSelected}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
}
