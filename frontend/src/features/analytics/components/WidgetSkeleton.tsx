interface WidgetSkeletonProps {
  rows?: number;
  type?: "rows" | "bars" | "kpi";
}

export const WidgetSkeleton = ({ rows = 4, type = "rows" }: WidgetSkeletonProps) => {
  if (type === "kpi") {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-8 w-16 rounded bg-muted" />
        <div className="h-2.5 w-20 rounded bg-muted" />
      </div>
    );
  }

  if (type === "bars") {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-28 rounded bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-muted-foreground/20"
                style={{ width: `${60 - i * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // rows — default for tables
  return (
    <div className="animate-pulse space-y-3">
      {/* header row */}
      <div className="flex gap-4 border-b pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-3 flex-1 rounded bg-muted" />
        ))}
      </div>
      {/* data rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: 4 }).map((_, j) => (
            <div
              key={j}
              className="h-3 flex-1 rounded bg-muted"
              style={{ opacity: 1 - i * 0.15 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};