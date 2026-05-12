"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

export function PublicNav({
  name,
  logoUrl,
  whatsappUrl,
  accent,
}: {
  name: string;
  logoUrl: string | null;
  whatsappUrl: string | null;
  accent: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all ${
        scrolled
          ? "border-b border-[color:var(--ink)]/10 bg-[color:var(--paper)]/90 text-[color:var(--ink)] backdrop-blur-md"
          : "text-[color:var(--paper)]"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <a href="#top" className="flex min-w-0 items-center gap-2 sm:gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-serif text-sm font-semibold text-[color:var(--paper)]"
              style={{ background: accent }}
            >
              {name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="truncate font-serif text-base font-semibold sm:text-lg">
            {name}
          </span>
        </a>

        <nav className="hidden items-center gap-5 text-sm md:flex">
          <a href="#servicios" className="opacity-80 transition-opacity hover:opacity-100">
            Servicios
          </a>
          <a href="#equipo" className="opacity-80 transition-opacity hover:opacity-100">
            Equipo
          </a>
          <a href="#ubicacion" className="opacity-80 transition-opacity hover:opacity-100">
            Ubicación
          </a>
        </nav>

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-transform hover:scale-105 sm:px-4 sm:py-2"
            style={{ background: accent, color: "var(--paper)" }}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Agendar</span>
          </a>
        ) : null}
      </div>
    </header>
  );
}
