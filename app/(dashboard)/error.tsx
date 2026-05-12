"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error.message);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center space-y-3">
        <h2 className="font-serif text-xl font-semibold">Error en el dashboard</h2>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          No se pudo cargar esta sección. Intenta de nuevo.
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-[color:var(--foreground)] px-4 py-2 text-sm font-medium text-[color:var(--background)]"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
