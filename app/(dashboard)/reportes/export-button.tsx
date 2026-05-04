"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportPdfButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.print()}
    >
      <Download className="mr-1 h-4 w-4" />
      Exportar PDF
    </Button>
  );
}
