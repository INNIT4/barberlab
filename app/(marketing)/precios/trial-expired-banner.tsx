"use client";

import { AlertTriangle } from "lucide-react";

export function TrialExpiredBanner() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-[oklch(0.6_0.22_30)] bg-[oklch(0.97_0.03_25)] p-6 text-center sm:flex-row sm:text-left">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[oklch(0.92_0.06_25)]">
          <AlertTriangle className="h-5 w-5 text-[oklch(0.45_0.18_25)]" />
        </div>
        <div>
          <p className="font-serif text-base font-semibold text-[oklch(0.35_0.15_25)]">
            Tu prueba gratuita terminó
          </p>
          <p className="mt-0.5 text-sm text-[oklch(0.4_0.1_25)]">
            Elige un plan para activar tu suscripción y seguir usando BarberLab.
          </p>
        </div>
      </div>
    </div>
  );
}
