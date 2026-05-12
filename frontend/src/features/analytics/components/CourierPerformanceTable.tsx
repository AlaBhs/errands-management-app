import { Badge } from "@/components/ui/badge";
import type { CourierPerformance } from "../types/analytics.types";

interface CourierPerformanceTableProps {
  data: CourierPerformance[];
}

const fmtMinutes = (mins: number | null): string => {
  if (mins == null) return "—";
  if (mins < 60) return `${Math.round(mins)}m`;
  return `${(mins / 60).toFixed(1)}h`;
};

const getScoreBadge = (row: CourierPerformance) => {
  const onTime     = row.onTimeRate     ?? 0;
  const rating     = row.avgRating      ?? 0;
  const completion = row.totalAssignments > 0
    ? (row.completed / row.totalAssignments) * 100
    : 0;
  const score = onTime * 0.5 + (rating / 5) * 100 * 0.3 + completion * 0.2;

  if (score >= 80) return { label: "Excellent",          className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400" };
  if (score >= 60) return { label: "Good",               className: "border-blue-200    bg-blue-50    text-blue-700    dark:border-blue-800    dark:bg-blue-950/30    dark:text-blue-400"    };
  if (score >= 40) return { label: "Needs Improvement",  className: "border-amber-200   bg-amber-50   text-amber-700   dark:border-amber-800   dark:bg-amber-950/30   dark:text-amber-400"   };
  return              { label: "Critical",               className: "border-rose-200    bg-rose-50    text-rose-700    dark:border-rose-800    dark:bg-rose-950/30    dark:text-rose-400"    };
};

const StarRating = ({ rating }: { rating: number | null }) => {
  if (rating == null) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-3 w-3 ${i < Math.round(rating) ? "text-amber-400" : "text-muted"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0
            00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364
            1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0
            00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1
            1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1
            0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
      <span className="ml-1 text-xs tabular-nums text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

const OnTimeBar = ({ rate }: { rate: number | null }) => {
  if (rate == null) return <span className="text-muted-foreground text-sm">—</span>;
  const color =
    rate >= 80 ? "bg-emerald-500"
    : rate >= 50 ? "bg-amber-400"
    : "bg-rose-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className={`text-xs tabular-nums font-medium
        ${rate >= 80 ? "text-emerald-600 dark:text-emerald-400"
        : rate >= 50 ? "text-amber-500 dark:text-amber-400"
        : "text-rose-500 dark:text-rose-400"}`}
      >
        {rate.toFixed(0)}%
      </span>
    </div>
  );
};

export const CourierPerformanceTable = ({ data }: CourierPerformanceTableProps) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left">
          {["Courier", "Score", "Assigned", "Completed", "Cancelled",
            "Avg Time", "Rating", "On-Time"].map((h) => (
            <th
              key={h}
              className="pb-3 text-xs font-medium uppercase tracking-wider
                         text-muted-foreground first:text-left last:text-left
                         [&:not(:first-child)]:text-right [&:nth-child(2)]:text-left"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y">
        {data.map((row) => {
          const score      = getScoreBadge(row);
          const completion = row.totalAssignments > 0
            ? Math.round((row.completed / row.totalAssignments) * 100)
            : 0;

          return (
            <tr
              key={row.courierId}
              className="group hover:bg-muted/30 transition-colors"
            >
              {/* Name */}
              <td className="py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center
                                  rounded-full bg-[var(--chart-1)]/10 text-xs font-bold
                                  text-[var(--chart-1)]">
                    {row.courierName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <span className="font-medium">{row.courierName}</span>
                </div>
              </td>

              {/* Score badge */}
              <td className="py-3">
                <Badge variant="outline" className={score.className}>
                  {score.label}
                </Badge>
              </td>

              {/* Assigned */}
              <td className="py-3 text-right tabular-nums">
                {row.totalAssignments}
              </td>

              {/* Completed */}
              <td className="py-3 text-right tabular-nums">
                <span className="font-medium">{row.completed}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ({completion}%)
                </span>
              </td>

              {/* Cancelled */}
              <td className="py-3 text-right tabular-nums">
                {row.cancelled > 0
                  ? <span className="text-rose-500 font-medium">{row.cancelled}</span>
                  : <span className="text-muted-foreground">0</span>
                }
              </td>

              {/* Avg execution */}
              <td className="py-3 text-right tabular-nums text-muted-foreground">
                {fmtMinutes(row.avgExecutionMinutes)}
              </td>

              {/* Star rating */}
              <td className="py-3 text-right">
                <div className="flex justify-end">
                  <StarRating rating={row.avgRating} />
                </div>
              </td>

              {/* On-time bar */}
              <td className="py-3">
                <div className="flex justify-end">
                  <OnTimeBar rate={row.onTimeRate} />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);