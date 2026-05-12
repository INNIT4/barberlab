import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-serif text-5xl font-semibold">404</h1>
      <p className="text-lg text-[color:var(--muted-foreground)]">
        Esta página no existe o fue movida.
      </p>
      <Link
        href="/"
        className="rounded-md bg-[color:var(--foreground)] px-4 py-2 text-sm font-medium text-[color:var(--background)] hover:opacity-90"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
