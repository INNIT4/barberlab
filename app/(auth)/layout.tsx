import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/marketing/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[color:var(--background)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 85% -10%, oklch(0.96 0.04 25 / 0.7), transparent 60%), radial-gradient(900px 500px at -10% 110%, oklch(0.95 0.03 80 / 0.6), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <header className="flex items-center justify-between px-6 py-5 lg:px-10">
        <Logo />
        <p className="text-sm text-[color:var(--muted-foreground)]">
          ¿Necesitas ayuda?{" "}
          <a
            href="https://wa.me/5216621234567"
            className="font-medium text-[color:var(--foreground)] underline-offset-4 hover:underline"
          >
            WhatsApp
          </a>
        </p>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-160px)] max-w-md items-center justify-center px-6 py-10">
        {children}
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-[color:var(--muted-foreground)] lg:px-10">
        <p>© {new Date().getFullYear()} BarberApp · Hecho en México</p>
        <nav className="flex items-center gap-4">
          <Link href="/terminos" className="hover:text-[color:var(--foreground)]">
            Términos
          </Link>
          <Link
            href="/privacidad"
            className="hover:text-[color:var(--foreground)]"
          >
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}
