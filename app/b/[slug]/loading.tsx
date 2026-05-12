export default function BookingLoading() {
  return (
    <div className="animate-pulse space-y-6 p-4 sm:p-6">
      <div className="h-8 w-2/3 rounded-md bg-[color:var(--muted)]" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-[color:var(--muted)]" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-4 w-1/4 rounded bg-[color:var(--muted)]" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-10 rounded-md bg-[color:var(--muted)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
