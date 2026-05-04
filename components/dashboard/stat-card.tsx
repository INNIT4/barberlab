import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type Tone = "default" | "positive" | "negative" | "warning";

const TONE_CLASSES: Record<Tone, string> = {
  default: "text-[color:var(--foreground)]",
  positive: "text-[oklch(0.45_0.15_150)]",
  negative: "text-[oklch(0.5_0.18_25)]",
  warning: "text-[oklch(0.45_0.15_80)]",
};

export function StatCard({
  label,
  value,
  hint,
  delta,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: { value: string; direction: "up" | "down" };
  tone?: Tone;
}) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className={cn(
            "font-serif text-3xl font-semibold tracking-tight",
            TONE_CLASSES[tone]
          )}
        >
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              delta.direction === "up"
                ? "text-[oklch(0.45_0.15_150)]"
                : "text-[oklch(0.5_0.18_25)]"
            )}
          >
            {delta.direction === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {delta.value}
          </span>
        )}
      </div>
      {hint && (
        <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
          {hint}
        </p>
      )}
    </div>
  );
}
