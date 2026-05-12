export const TrendChartSkeleton = () => (
  <div className="animate-pulse">
    {/* Stats header */}
    <div className="mb-4 flex items-center justify-between">
      <div className="space-y-1.5">
        <div className="h-2.5 w-16 rounded bg-muted" />
        <div className="h-6 w-10 rounded bg-muted" />
      </div>
      <div className="space-y-1.5">
        <div className="h-2.5 w-20 rounded bg-muted ml-auto" />
        <div className="h-6 w-10 rounded bg-muted ml-auto" />
      </div>
    </div>

    {/* Area chart shape */}
    <div className="w-full min-h-[200px]">
      <svg
        viewBox="0 0 600 260"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="skelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[52, 100, 148, 196].map((y) => (
          <line
            key={y}
            x1="36" y1={y} x2="584" y2={y}
            stroke="currentColor"
            strokeOpacity="0.06"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Y-axis placeholders */}
        {[52, 100, 148, 196].map((y, i) => (
          <rect
            key={y}
            x="0" y={y - 5}
            width={i % 2 === 0 ? 22 : 16}
            height="8" rx="3"
            fill="currentColor" opacity="0.08"
          />
        ))}

        {/* Area fill */}
        <path
          d="M 36 180
             C 130 180 130 90  184 110
             C 238 130 238 60  294 75
             C 350 90  350 130 404 105
             C 458 80  458 55  514 70
             C 550 80  567 95  584 88
             L 584 224 L 36 224 Z"
          fill="url(#skelGrad)"
        />

        {/* Line */}
        <path
          d="M 36 180
             C 130 180 130 90  184 110
             C 238 130 238 60  294 75
             C 350 90  350 130 404 105
             C 458 80  458 55  514 70
             C 550 80  567 95  584 88"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Dots */}
        {[[36,180],[184,110],[294,75],[404,105],[514,70],[584,88]].map(
          ([cx, cy], i) => (
            <circle
              key={i} cx={cx} cy={cy} r="4"
              fill="currentColor" opacity="0.12"
            />
          )
        )}

        {/* X-axis placeholders */}
        {[36, 147, 258, 369, 480, 584].map((x, i) => (
          <rect
            key={i}
            x={x - 10} y={238}
            width="20" height="8" rx="3"
            fill="currentColor" opacity="0.08"
          />
        ))}
      </svg>
    </div>
  </div>
);