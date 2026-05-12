import { Badge } from "@/components/ui/badge";
import type { CostBreakdown } from "../types/analytics.types";

interface CostBreakdownTableProps {
  data: CostBreakdown[];
}

const fmt = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style:                 "currency",
    currency:              "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const CostBreakdownTable = ({ data }: CostBreakdownTableProps) => {
  const totals = data.reduce(
    (acc, row) => ({
      estimated: acc.estimated + row.estimatedCost,
      actual:    acc.actual    + row.actualCost,
    }),
    { estimated: 0, actual: 0 }
  );

  const maxVarianceAbs = Math.max(
    ...data.map((r) => Math.abs(r.actualCost - r.estimatedCost)), 1
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Category
            </th>
            <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Estimated
            </th>
            <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Actual
            </th>
            <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Variance
            </th>
            <th className="pb-3 pl-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Impact
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row) => {
            const variance  = row.actualCost - row.estimatedCost;
            const isOver    = variance > 0;
            const isZero    = variance === 0;
            const varPct    = row.estimatedCost > 0
              ? ((variance / row.estimatedCost) * 100).toFixed(1)
              : null;
            const barWidth  = Math.round(
              (Math.abs(variance) / maxVarianceAbs) * 100
            );
            const label     = row.category.replace(/([A-Z])/g, " $1").trim();

            return (
              <tr key={row.category} className="group hover:bg-muted/30 transition-colors">
                <td className="py-3 font-medium">{label}</td>
                <td className="py-3 text-right tabular-nums text-muted-foreground">
                  {fmt(row.estimatedCost)}
                </td>
                <td className="py-3 text-right tabular-nums font-medium">
                  {fmt(row.actualCost)}
                </td>
                <td className="py-3 text-right tabular-nums">
                  <div className="flex items-center justify-end gap-2">
                    {varPct && (
                      <Badge
                        variant="outline"
                        className={
                          isZero
                            ? "text-muted-foreground"
                            : isOver
                              ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400"
                              : "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                        }
                      >
                        {isOver ? "+" : ""}{varPct}%
                      </Badge>
                    )}
                    <span
                      className={
                        isZero ? "text-muted-foreground"
                          : isOver ? "text-rose-500 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }
                    >
                      {isOver ? "+" : ""}{fmt(variance)}
                    </span>
                  </div>
                </td>
                <td className="py-3 pl-4">
                  <div className="flex w-24 items-center gap-1.5">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500
                          ${isZero ? "bg-muted-foreground" : isOver ? "bg-rose-400" : "bg-emerald-500"}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t">
            <td className="pt-3 font-semibold">Total</td>
            <td className="pt-3 text-right tabular-nums text-muted-foreground font-medium">
              {fmt(totals.estimated)}
            </td>
            <td className="pt-3 text-right tabular-nums font-bold">
              {fmt(totals.actual)}
            </td>
            <td className="pt-3 text-right tabular-nums">
              <span
                className={`font-semibold ${
                  totals.actual <= totals.estimated
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-500 dark:text-rose-400"
                }`}
              >
                {totals.actual > totals.estimated ? "+" : ""}
                {fmt(totals.actual - totals.estimated)}
              </span>
            </td>
            <td className="pt-3 pl-4" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
};