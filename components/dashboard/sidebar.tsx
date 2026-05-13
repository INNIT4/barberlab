import { Logo } from "@/components/marketing/logo";
import { Badge } from "@/components/ui/badge";
import { SidebarNav } from "./sidebar-nav";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { PLAN_BY_ID } from "@/lib/data/plans";
import { ThemeToggle } from "./theme-toggle";

export async function Sidebar() {
  const { org, role } = await getCurrentOrg();
  const plan = PLAN_BY_ID[org.plan];

  return (
    <aside className="hidden w-64 flex-none flex-col border-r border-[color:var(--border)] bg-[color:var(--card)] lg:flex">
      <div className="flex h-16 items-center justify-between border-b border-[color:var(--border)] px-6">
        <Logo />
        <ThemeToggle />
      </div>

      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
              Barbería
            </p>
            <p className="mt-0.5 font-serif text-base font-semibold leading-tight">
              {org.name}
            </p>
          </div>
          <Badge variant="secondary" className="bg-[oklch(0.96_0.02_25)] text-[oklch(0.45_0.15_25)]">
            {plan.name}
          </Badge>
        </div>
      </div>

      <SidebarNav role={role} />

      <div className="mt-auto space-y-3 p-4">
        <Link
          href={`/b/${org.slug}`}
          target="_blank"
          className="flex items-center justify-between rounded-lg border border-dashed border-[color:var(--border)] bg-[oklch(0.985_0.005_80)] px-3 py-2.5 text-xs font-medium text-[color:var(--muted-foreground)] transition-colors hover:border-[color:var(--foreground)] hover:text-[color:var(--foreground)]"
        >
          <span>
            Ver página pública
            <br />
            <span className="font-mono opacity-70">/b/{org.slug}</span>
          </span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
