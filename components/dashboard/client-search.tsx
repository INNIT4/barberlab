"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClientSearch() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="hidden sm:inline-flex"
      onClick={() => document.dispatchEvent(new CustomEvent("command-palette:open"))}
    >
      <Search className="mr-2 h-4 w-4" />
      Buscar
      <kbd className="ml-3 rounded bg-[oklch(0.97_0.005_80)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[color:var(--muted-foreground)]">
        ⌘K
      </kbd>
    </Button>
  );
}
