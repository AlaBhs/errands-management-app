export const CategoryChartSkeleton = () => (
  <div className="animate-pulse space-y-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-muted" />
            <div
              className="h-3 rounded bg-muted"
              style={{ width: `${80 + (i % 3) * 20}px` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-muted" />
            <div className="h-3 w-8 rounded bg-muted" />
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-muted-foreground/20"
            style={{ width: `${90 - i * 15}%` }}
          />
        </div>
      </div>
    ))}
    <div className="flex items-center justify-between border-t pt-3 px-3">
      <div className="h-2.5 w-32 rounded bg-muted" />
      <div className="h-2.5 w-8 rounded bg-muted" />
    </div>
  </div>
);