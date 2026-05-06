import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UpgradeBanner({
  title,
  description,
  requiredPlan = "Pro",
}: {
  title: string;
  description: string;
  requiredPlan?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--muted)]/60">
        <Lock className="h-6 w-6 text-[color:var(--muted-foreground)]" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">
        Plan {requiredPlan} requerido
      </p>
      <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-[color:var(--muted-foreground)]">
        {description}
      </p>
      <Button asChild className="mt-6">
        <Link href="/precios">Ver planes</Link>
      </Button>
    </div>
  );
}
