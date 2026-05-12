export const CostBreakdownSkeleton = () => (
  <div className="animate-pulse">
    {/* Header row */}
    <div className="flex gap-4 border-b pb-3 mb-1">
      <div className="h-2.5 w-24 rounded bg-muted" />
      <div className="ml-auto h-2.5 w-16 rounded bg-muted" />
      <div className="h-2.5 w-16 rounded bg-muted" />
      <div className="h-2.5 w-20 rounded bg-muted" />
      <div className="h-2.5 w-14 rounded bg-muted" />
    </div>

    {/* Data rows */}
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 border-b py-3.5"
        style={{ opacity: 1 - i * 0.12 }}
      >
        <div
          className="h-3 rounded bg-muted"
          style={{ width: `${72 + (i % 3) * 16}px` }}
        />
        <div className="ml-auto h-3 w-16 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-10 rounded-full bg-muted" />
          <div className="h-3 w-12 rounded bg-muted" />
        </div>
        <div className="h-1.5 w-24 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-muted-foreground/20"
            style={{ width: `${30 + (i % 4) * 15}%` }}
          />
        </div>
      </div>
    ))}

    {/* Footer */}
    <div className="flex items-center gap-4 pt-3">
      <div className="h-3 w-10 rounded bg-muted" />
      <div className="ml-auto h-3 w-16 rounded bg-muted" />
      <div className="h-3 w-16 rounded bg-muted" />
      <div className="h-3 w-20 rounded bg-muted" />
      <div className="w-24" />
    </div>
  </div>
);