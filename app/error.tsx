"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-serif text-3xl font-semibold">Algo salió mal</h1>
      <p className="text-sm text-[color:var(--muted-foreground)]">
        Ocurrió un error inesperado. Intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-[color:var(--foreground)] px-4 py-2 text-sm font-medium text-[color:var(--background)] hover:opacity-90"
      >
        Reintentar
      </button>
    </main>
  );
}
