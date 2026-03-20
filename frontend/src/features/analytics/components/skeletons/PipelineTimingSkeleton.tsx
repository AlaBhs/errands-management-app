export const PipelineTimingSkeleton = () => (
  <div className="animate-pulse rounded-xl border bg-card p-6 shadow-sm">
    {/* Header */}
    <div className="mb-5 flex items-start justify-between">
      <div className="space-y-1.5">
        <div className="h-4 w-44 rounded bg-muted" />
        <div className="h-3 w-36 rounded bg-muted" />
      </div>
      <div className="space-y-1.5 text-right">
        <div className="h-3 w-20 rounded bg-muted ml-auto" />
        <div className="h-6 w-14 rounded bg-muted ml-auto" />
      </div>
    </div>

    {/* Stage rows */}
    <div className="space-y-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-2.5 w-36 rounded bg-muted" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-10 rounded bg-muted" />
              <div className="h-5 w-10 rounded-full bg-muted" />
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-muted-foreground/20"
              style={{ width: `${65 - i * 15}%` }}
            />
          </div>
        </div>
      ))}
    </div>

    {/* Separator */}
    <div className="my-5 h-px bg-muted" />

    {/* Bottleneck callout */}
    <div className="flex gap-3 rounded-lg bg-muted/50 p-3">
      <div className="h-5 w-5 shrink-0 rounded-full bg-muted" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-full rounded bg-muted" />
        <div className="h-2.5 w-3/4 rounded bg-muted" />
      </div>
    </div>
  </div>
);