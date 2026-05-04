"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  Scissors,
  UserCheck,
  BarChart3,
  Settings,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/barberos", label: "Barberos", icon: UserCheck },
  { href: "/servicios", label: "Servicios", icon: Scissors },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/gastos", label: "Gastos", icon: Receipt },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                : "text-[color:var(--muted-foreground)] hover:bg-[oklch(0.96_0.008_80)] hover:text-[color:var(--foreground)]"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-colors",
                active
                  ? "text-[color:var(--background)]"
                  : "text-[color:var(--muted-foreground)] group-hover:text-[color:var(--foreground)]"
              )}
              strokeWidth={1.8}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
