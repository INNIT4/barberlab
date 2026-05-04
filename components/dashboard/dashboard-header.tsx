import { desc, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { UserMenu } from "./user-menu";
import { ClientSearch } from "./client-search";
import { NotificationsBell } from "./notifications-bell";

function initials(email: string) {
  const parts = email.split("@")[0].split(/[._-]/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export async function DashboardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { user, org } = await getCurrentOrg();
  const email = user.email ?? "";
  const abbr = initials(email || org.name);
  const displayName = email.split("@")[0] || org.name;

  const notifs = await db
    .select({
      id: notifications.id,
      title: notifications.title,
      body: notifications.body,
      read: notifications.read,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.organizationId, org.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--background)]/90 px-6 backdrop-blur-md lg:px-8">
      <div className="min-w-0">
        <h1 className="truncate font-serif text-2xl font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-xs text-[color:var(--muted-foreground)]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {action}
        <ClientSearch />
        <NotificationsBell
          notifications={notifs.map((n) => ({
            id: n.id,
            title: n.title,
            body: n.body,
            read: n.read,
            createdAt: n.createdAt.toISOString(),
          }))}
        />

        <UserMenu
          email={email}
          orgName={org.name}
          abbr={abbr}
          displayName={displayName}
        />
      </div>
    </header>
  );
}
