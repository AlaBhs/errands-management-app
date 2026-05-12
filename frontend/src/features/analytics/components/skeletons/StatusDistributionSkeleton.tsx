export const StatusDistributionSkeleton = () => (
  <div className="animate-pulse">
    {/* Stacked bar */}
    <div className="mb-6 h-3 w-full rounded-full bg-muted" />
    {/* Status cards grid */}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3
                    lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-16 rounded bg-muted" />
            <div className="h-4 w-8 rounded-full bg-muted" />
          </div>
          <div className="h-7 w-10 rounded bg-muted" />
          <div className="h-2 w-20 rounded bg-muted" />
          <div className="h-1 w-full rounded-full bg-muted" />
        </div>
      ))}
    </div>
  </div>
);