export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen animate-pulse">
      <aside className="hidden w-56 flex-shrink-0 border-r border-[color:var(--border)] bg-[color:var(--card)] lg:block" />
      <main className="flex-1 p-6 space-y-6">
        <div className="h-8 w-1/3 rounded-md bg-[color:var(--muted)]" />
        <div className="h-4 w-2/3 rounded-md bg-[color:var(--muted)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-32 rounded-lg bg-[color:var(--muted)]" />
          <div className="h-32 rounded-lg bg-[color:var(--muted)]" />
          <div className="h-32 rounded-lg bg-[color:var(--muted)]" />
        </div>
      </main>
    </div>
  );
}
