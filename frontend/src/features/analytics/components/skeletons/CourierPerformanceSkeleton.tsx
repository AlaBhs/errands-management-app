export const CourierPerformanceSkeleton = () => (
  <div className="animate-pulse">
    {/* Header */}
    <div className="flex gap-6 border-b pb-3 mb-1">
      {[48, 36, 20, 24, 24, 20, 28, 32].map((w, i) => (
        <div key={i} className="h-2.5 rounded bg-muted"
             style={{ width: `${w}px` }} />
      ))}
    </div>

    {/* Rows — one per courier */}
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="flex items-center gap-6 border-b py-4"
           style={{ opacity: 1 - i * 0.2 }}>
        {/* Avatar + name */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
        {/* Score badge */}
        <div className="h-5 w-20 rounded-full bg-muted" />
        {/* Numeric cells */}
        {Array.from({ length: 3 }).map((_, j) => (
          <div key={j} className="h-3 w-8 rounded bg-muted ml-auto" />
        ))}
        {/* Avg time */}
        <div className="h-3 w-10 rounded bg-muted" />
        {/* Stars */}
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="h-3 w-3 rounded-sm bg-muted" />
          ))}
        </div>
        {/* On-time bar */}
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-16 rounded-full bg-muted" />
          <div className="h-3 w-8 rounded bg-muted" />
        </div>
      </div>
    ))}
  </div>
);