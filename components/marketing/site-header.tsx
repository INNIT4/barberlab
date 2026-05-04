import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

const NAV_LINKS = [
  { href: "/#caracteristicas", label: "Características" },
  { href: "/precios", label: "Precios" },
  { href: "/#preguntas", label: "Preguntas" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[color:var(--border)] bg-[color:var(--background)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav
          aria-label="Principal"
          className="hidden items-center gap-7 md:flex"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild size="sm" className="shadow-sm">
            <Link href="/signup">Probar 14 días gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
