import Link from "next/link";
import { Logo } from "./logo";

const SECTIONS = [
  {
    title: "Producto",
    links: [
      { href: "/#caracteristicas", label: "Características" },
      { href: "/precios", label: "Precios" },
      { href: "/#preguntas", label: "Preguntas frecuentes" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "/sobre-nosotros", label: "Sobre nosotros" },
      { href: "/contacto", label: "Contacto" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacidad", label: "Privacidad" },
      { href: "/terminos", label: "Términos" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-20 border-t-2 border-double border-[color:var(--ink)]/40 bg-[color:var(--paper-deep)]/40">
      <div aria-hidden className="h-1 bg-[color:var(--oxblood)]" />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {/* Colophon top row */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--ink)]/15 pb-3 text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
          <span>Colofón · Fin de la edición</span>
          <span className="font-display text-base italic normal-case tracking-normal text-[color:var(--oxblood)]">
            ❦
          </span>
          <span>MMXXVI · Vol. 1 · No. 4</span>
        </div>

        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs font-serif text-[15px] leading-relaxed text-[color:var(--foreground)]/75">
              La agenda online hecha en México para las barberías que quieren
              crecer{" "}
              <span className="italic">sin comisiones por cita</span>.
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
              Hola@barberapp.mx
            </p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 stamp text-[color:var(--oxblood)]">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="font-serif text-[15px] text-[color:var(--ink)] transition-colors hover:text-[color:var(--oxblood)] hover:underline hover:underline-offset-4"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-[color:var(--ink)]/15 pt-5 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)] sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} BarberApp · Hecho con orgullo en
            Sonora, México
          </p>
          <p className="font-display text-sm italic normal-case tracking-normal text-[color:var(--ink)]/60">
            Impreso en tinta digital
          </p>
        </div>
      </div>
    </footer>
  );
}
