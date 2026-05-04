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
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all ${
        scrolled
          ? "border-b border-[oklch(0.25_0.02_60)] bg-[oklch(0.15_0.01_60)]/90 backdrop-blur-md"
          : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-3">
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
              className="flex h-9 w-9 items-center justify-center rounded-full font-serif text-sm font-semibold"
              style={{ background: accent, color: "oklch(0.15 0.01 60)" }}
            >
              {name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="font-serif text-lg font-semibold">{name}</span>
        </a>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a href="#servicios" className="opacity-80 transition-opacity hover:opacity-100">
            Servicios
          </a>
          <a href="#equipo" className="opacity-80 transition-opacity hover:opacity-100">
            Equipo
          </a>
          <a href="#agendar" className="opacity-80 transition-opacity hover:opacity-100">
            Agendar
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
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:scale-105"
            style={{ background: accent, color: "oklch(0.15 0.01 60)" }}
          >
            <MessageCircle className="h-4 w-4" />
            Agendar
          </a>
        ) : null}
      </div>
    </header>
  );
}
