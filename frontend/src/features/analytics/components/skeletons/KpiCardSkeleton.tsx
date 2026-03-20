export const KpiCardSkeleton = () => (
  <div className="animate-pulse rounded-xl border-l-4 border-l-muted
                  bg-card p-5 shadow-sm flex items-start gap-4">
    <div className="h-10 w-10 shrink-0 rounded-lg bg-muted" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-2.5 w-24 rounded bg-muted" />
      <div className="h-7 w-16 rounded bg-muted" />
      <div className="h-2 w-20 rounded bg-muted" />
    </div>
  </div>
);