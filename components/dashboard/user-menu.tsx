"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutAction } from "@/app/(auth)/actions";

export function UserMenu({
  email,
  orgName,
  abbr,
  displayName,
}: {
  email: string;
  orgName: string;
  abbr: string;
  displayName: string;
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] py-1 pl-1 pr-3 text-sm transition-colors hover:bg-[oklch(0.97_0.005_80)]"
          aria-label="Menú de usuario"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-[oklch(0.25_0.03_60)] text-xs font-semibold text-[color:var(--background)]">
              {abbr}
            </AvatarFallback>
          </Avatar>
          <span className="hidden font-medium sm:inline">{displayName}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium">{orgName}</p>
          <p className="text-xs text-[color:var(--muted-foreground)]">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/ajustes")}>
          Mi cuenta
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/ajustes")}>
          Ajustes de barbería
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/precios")}>
          Facturación y plan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <DropdownMenuItem asChild>
            <button
              type="submit"
              className="w-full text-left text-[oklch(0.5_0.18_25)]"
            >
              Cerrar sesión
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
