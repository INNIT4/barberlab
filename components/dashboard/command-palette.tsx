"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Users,
  Scissors,
  UserCheck,
  BarChart3,
  Settings,
  Search,
  Receipt,
} from "lucide-react";

const COMMANDS = [
  { id: "agenda", label: "Agenda", icon: Calendar, href: "/agenda", shortcut: "A" },
  { id: "barberos", label: "Barberos", icon: UserCheck, href: "/barberos", shortcut: "B" },
  { id: "servicios", label: "Servicios", icon: Scissors, href: "/servicios", shortcut: "S" },
  { id: "clientes", label: "Clientes", icon: Users, href: "/clientes", shortcut: "C" },
  { id: "gastos", label: "Gastos", icon: Receipt, href: "/gastos", shortcut: "G" },
  { id: "reportes", label: "Reportes", icon: BarChart3, href: "/reportes", shortcut: "R" },
  { id: "ajustes", label: "Ajustes", icon: Settings, href: "/ajustes", shortcut: "J" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();

  const filtered = query
    ? COMMANDS.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase())
      )
    : COMMANDS;

  const select = useCallback(
    (index: number) => {
      const cmd = filtered[index];
      if (cmd) {
        router.push(cmd.href);
        setOpen(false);
      }
    },
    [filtered, router]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setSelected(0);
      }
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        select(selected);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const custom = () => {
      setOpen((v) => !v);
      setQuery("");
      setSelected(0);
    };

    document.addEventListener("keydown", down);
    document.addEventListener("command-palette:open", custom);
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("command-palette:open", custom);
    };
  }, [open, selected, filtered.length, select]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="relative z-50 w-full max-w-md rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-2xl">
        <div className="flex items-center border-b border-[color:var(--border)] px-4">
          <Search className="mr-2 h-4 w-4 text-[color:var(--muted-foreground)]" />
          <input
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[color:var(--muted-foreground)]"
            placeholder="Buscar página... (ej: agenda, clientes)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            autoFocus
          />
          <kbd className="rounded bg-[oklch(0.96_0.005_80)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[color:var(--muted-foreground)]">
            ESC
          </kbd>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[color:var(--muted-foreground)]">
              Sin resultados
            </p>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => select(i)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    i === selected
                      ? "bg-[oklch(0.96_0.008_80)]"
                      : "hover:bg-[oklch(0.98_0.005_80)]"
                  }`}
                >
                  <Icon className="h-4 w-4 text-[color:var(--muted-foreground)]" />
                  <span className="flex-1 text-left">{cmd.label}</span>
                  <kbd className="rounded bg-[oklch(0.96_0.005_80)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[color:var(--muted-foreground)]">
                    {cmd.shortcut}
                  </kbd>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
