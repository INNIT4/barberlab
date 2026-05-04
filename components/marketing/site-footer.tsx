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
    <footer className="mt-24 border-t border-[color:var(--border)] bg-[oklch(0.985_0.005_80)]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              La agenda online hecha en México para las barberías que quieren
              crecer sin comisiones por cita.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-[color:var(--foreground)] hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[color:var(--border)] pt-6 text-xs text-[color:var(--muted-foreground)] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} BarberApp. Hecho con orgullo en Sonora, México.</p>
          <p>hola@barberapp.mx</p>
        </div>
      </div>
    </footer>
  );
}
