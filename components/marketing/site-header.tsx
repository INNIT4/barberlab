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
    <header className="sticky top-0 z-40 w-full bg-[color:var(--background)]/92 backdrop-blur-md">
      {/* Top hairline tape — date + edition */}
      <div className="hidden border-b border-[color:var(--border)] md:block">
        <div className="mx-auto flex h-7 max-w-6xl items-center justify-between px-4 text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)] sm:px-6">
          <span>Edición fundadores · MMXXVI</span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-1 w-1 rounded-full bg-[color:var(--oxblood)]" />
            Hecho en Sonora, México
            <span className="inline-block h-1 w-1 rounded-full bg-[color:var(--oxblood)]" />
          </span>
          <span>Vol. 1 · No. 4</span>
        </div>
      </div>

      <div className="border-b border-[color:var(--border)] shadow-[0_3px_0_-2px_var(--border)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />

          <nav
            aria-label="Principal"
            className="hidden items-center gap-8 md:flex"
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="stamp-tight text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--oxblood)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex stamp-tight">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild size="sm" className="stamp-tight bg-[color:var(--ink)] text-[color:var(--paper)] hover:bg-[color:var(--oxblood)]">
              <Link href="/signup">Probar 1 mes</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
