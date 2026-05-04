"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        className={`rounded-md p-2 text-[color:var(--muted-foreground)] ${className ?? ""}`}
        aria-label="Cambiar tema"
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`rounded-md p-2 text-[color:var(--muted-foreground)] transition-colors hover:bg-[oklch(0.96_0.008_80)] hover:text-[color:var(--foreground)] ${className ?? ""}`}
      aria-label={isDark ? "Tema claro" : "Tema oscuro"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
