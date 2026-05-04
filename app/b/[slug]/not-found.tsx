import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.7_0.05_60)]">
        Error 404
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold">
        Barbería no encontrada
      </h1>
      <p className="mt-3 max-w-md text-sm text-[oklch(0.8_0.02_60)]">
        La URL que buscas no corresponde a ninguna barbería registrada en
        BarberApp.
      </p>
      <Link
        href="https://barberapp.mx"
        className="mt-6 rounded-full bg-[oklch(0.98_0.01_80)] px-5 py-2 text-sm font-medium text-[oklch(0.15_0.01_60)] transition-colors hover:bg-white"
      >
        Ir a BarberApp
      </Link>
    </div>
  );
}
