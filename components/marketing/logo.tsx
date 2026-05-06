import { cn } from "@/lib/utils";
import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 text-[color:var(--foreground)]",
        className
      )}
      aria-label="BarberLab — inicio"
    >
      {/* Mini barber pole */}
      <span
        aria-hidden
        className="relative inline-flex h-9 w-3 overflow-hidden rounded-full ring-1 ring-[color:var(--ink)]/30 shadow-[0_1px_0_oklch(1_0_0/0.6)_inset,0_2px_4px_oklch(0.18_0.02_50/0.15)]"
      >
        <span className="absolute inset-0 barber-pole" />
        <span className="absolute inset-x-0 top-0 h-1 rounded-t-full bg-[color:var(--brass)] ring-1 ring-black/10" />
        <span className="absolute inset-x-0 bottom-0 h-1 rounded-b-full bg-[color:var(--brass)] ring-1 ring-black/10" />
      </span>

      <span className="flex items-baseline gap-0.5 leading-none">
        <span className="font-display text-[1.35rem] tracking-tight">
          Barber
        </span>
        <span className="font-display text-[1.35rem] italic text-[color:var(--oxblood)] tracking-tight">
          App
        </span>
      </span>
    </Link>
  );
}
