import { cn } from "@/lib/utils";
import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2 font-serif text-[color:var(--foreground)]",
        className
      )}
      aria-label="BarberApp — inicio"
    >
      <span
        aria-hidden
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--foreground)] text-[color:var(--background)] shadow-[0_1px_0_0_rgba(0,0,0,0.1)] ring-1 ring-black/10"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M6 9a3 3 0 1 0 2.12 5.12L12 10.24l3.88 3.88A3 3 0 1 0 18 9" />
          <line x1="8.12" y1="14.12" x2="12" y2="10.24" />
          <line x1="15.88" y1="14.12" x2="12" y2="10.24" />
        </svg>
      </span>
      <span className="text-lg font-semibold leading-none tracking-tight">
        Barber<span className="italic text-[oklch(0.45_0.15_25)]">App</span>
      </span>
    </Link>
  );
}
