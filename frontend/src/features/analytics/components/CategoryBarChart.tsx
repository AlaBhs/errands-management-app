import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface CategoryBarChartProps {
  data: Record<string, number>;
}

// Color palette cycles through chart CSS variables — works for any number
// of categories without hardcoding names
const BAR_COLORS = [
  "bg-[var(--chart-1)]",
  "bg-violet-500",
  "bg-amber-400",
  "bg-emerald-500",
  "bg-rose-400",
  "bg-cyan-500",
  "bg-orange-400",
  "bg-pink-500",
];

const formatLabel = (key: string): string =>
  key.replace(/([A-Z])/g, " $1").trim();

export const CategoryBarChart = ({ data }: CategoryBarChartProps) => {
  const total   = Object.values(data).reduce((s, v) => s + v, 0);
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max     = entries[0]?.[1] ?? 1;

  if (total === 0) return null;

  return (
    <TooltipProvider>
      <div className="space-y-1">
        {entries.map(([category, count], index) => {
          const pct      = Math.round((count / total) * 100);
          const barWidth = Math.round((count / max) * 100);
          const color    = BAR_COLORS[index % BAR_COLORS.length];
          const isTop    = index === 0;
          const label    = formatLabel(category);

          return (
            <Tooltip key={category}>
              <TooltipTrigger asChild>
                <div
                  className="group cursor-default rounded-lg p-3
                             transition-colors hover:bg-muted/50"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    {/* Left — color dot + label + top badge */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${color}`}
                      />
                      <span className="text-sm font-medium truncate">
                        {label}
                      </span>
                      {isTop && (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-amber-200 bg-amber-50
                                     text-amber-700 text-[10px] px-1.5 py-0
                                     dark:border-amber-800 dark:bg-amber-950/30
                                     dark:text-amber-400"
                        >
                          Top
                        </Badge>
                      )}
                    </div>

                    {/* Right — count + percentage */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold tabular-nums">
                        {count}
                      </span>
                      <span className="w-8 text-right text-xs
                                       tabular-nums text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Bar — width relative to max category, not total */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-1.5 rounded-full transition-all
                                  duration-700 ${color}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{label}</p>
                <p className="text-muted-foreground">
                  {count} request{count !== 1 ? "s" : ""} · {pct}% of total
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-3 mt-1 px-3">
          <span className="text-xs text-muted-foreground">
            Total across all categories
          </span>
          <span className="text-sm font-bold tabular-nums">{total}</span>
        </div>
      </div>
    </TooltipProvider>
  );
};