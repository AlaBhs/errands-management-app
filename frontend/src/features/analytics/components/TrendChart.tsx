import type { TrendPoint } from "../types/analytics.types";

interface TrendChartProps {
  data: TrendPoint[];
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const TrendChart = ({ data }: TrendChartProps) => {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((point) => {
        const heightPct = Math.round((point.count / max) * 100);
        const label = MONTH_LABELS[point.month - 1];

        return (
          <div
            key={`${point.year}-${point.month}`}
            className="group flex flex-1 flex-col items-center gap-1"
          >
            {/* count tooltip on hover */}
            <span className="invisible text-xs font-semibold text-foreground group-hover:visible">
              {point.count}
            </span>
            <div className="flex w-full flex-col justify-end" style={{ height: "120px" }}>
              <div
                className="w-full rounded-t-sm bg-primary transition-all duration-500"
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        );
      })}
    </div>
  );
};