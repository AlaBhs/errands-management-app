import type { CourierPerformance } from "../types";

interface Props {
  data: CourierPerformance[];
}

const fmtMinutes = (mins: number | null): string => {
  if (mins == null) return "—";
  if (mins < 60) return `${Math.round(mins)}m`;
  return `${(mins / 60).toFixed(1)}h`;
};

const fmtRating = (r: number | null): string =>
  r != null ? `${r.toFixed(1)} / 5` : "—";

const fmtOnTime = (r: number | null): string =>
  r != null ? `${r.toFixed(1)}%` : "—";

const onTimeColor = (r: number | null): string => {
  if (r == null) return "text-muted-foreground";
  if (r >= 80) return "text-emerald-600 font-medium";
  if (r >= 50) return "text-amber-500 font-medium";
  return "text-destructive font-medium";
};

const ratingColor = (r: number | null): string => {
  if (r == null) return "text-muted-foreground";
  if (r >= 4) return "text-emerald-600 font-medium";
  if (r >= 3) return "text-amber-500 font-medium";
  return "text-destructive font-medium";
};

export const CourierPerformanceTable = ({ data }: Props) => {
  if (data.length === 0)
    return (
      <p className="text-sm text-muted-foreground">No courier data available.</p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 font-medium">Courier</th>
            <th className="pb-2 text-right font-medium">Assigned</th>
            <th className="pb-2 text-right font-medium">Completed</th>
            <th className="pb-2 text-right font-medium">Cancelled</th>
            <th className="pb-2 text-right font-medium">Avg Execution</th>
            <th className="pb-2 text-right font-medium">Avg Rating</th>
            <th className="pb-2 text-right font-medium">On-Time Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row) => {
            const completionRate =
              row.totalAssignments > 0
                ? Math.round((row.completed / row.totalAssignments) * 100)
                : 0;

            return (
              <tr key={row.courierId} className="hover:bg-muted/40 transition-colors">
                <td className="py-3 font-medium">{row.courierName}</td>
                <td className="py-3 text-right tabular-nums">
                  {row.totalAssignments}
                </td>
                <td className="py-3 text-right tabular-nums">
                  {row.completed}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({completionRate}%)
                  </span>
                </td>
                <td className="py-3 text-right tabular-nums">
                  {row.cancelled > 0 ? (
                    <span className="text-destructive">{row.cancelled}</span>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </td>
                <td className="py-3 text-right tabular-nums">
                  {fmtMinutes(row.avgExecutionMinutes)}
                </td>
                <td className={`py-3 text-right tabular-nums ${ratingColor(row.avgRating)}`}>
                  {fmtRating(row.avgRating)}
                </td>
                <td className={`py-3 text-right tabular-nums ${onTimeColor(row.onTimeRate)}`}>
                  {fmtOnTime(row.onTimeRate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};