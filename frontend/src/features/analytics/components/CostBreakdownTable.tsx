import type { CostBreakdown } from "../types/analytics.types";

interface CostBreakdownTableProps {
  data: CostBreakdown[];
}

const fmt = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

export const CostBreakdownTable = ({ data }: CostBreakdownTableProps) => {
  const totals = data.reduce(
    (acc, row) => ({
      estimated: acc.estimated + row.estimatedCost,
      actual: acc.actual + row.actualCost,
    }),
    { estimated: 0, actual: 0 }
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 font-medium">Category</th>
            <th className="pb-2 text-right font-medium">Estimated</th>
            <th className="pb-2 text-right font-medium">Actual</th>
            <th className="pb-2 text-right font-medium">Variance</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row) => {
            const variance = row.actualCost - row.estimatedCost;
            const isOver = variance > 0;
            return (
              <tr key={row.category} className="py-2">
                <td className="py-2 font-medium">{row.category}</td>
                <td className="py-2 text-right tabular-nums">
                  {fmt(row.estimatedCost)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {fmt(row.actualCost)}
                </td>
                <td
                  className={`py-2 text-right tabular-nums font-medium ${
                    variance === 0
                      ? "text-muted-foreground"
                      : isOver
                      ? "text-destructive"
                      : "text-emerald-600"
                  }`}
                >
                  {isOver ? "+" : ""}
                  {fmt(variance)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t font-semibold">
            <td className="pt-2">Total</td>
            <td className="pt-2 text-right tabular-nums">
              {fmt(totals.estimated)}
            </td>
            <td className="pt-2 text-right tabular-nums">
              {fmt(totals.actual)}
            </td>
            <td
              className={`pt-2 text-right tabular-nums ${
                totals.actual - totals.estimated > 0
                  ? "text-destructive"
                  : "text-emerald-600"
              }`}
            >
              {totals.actual - totals.estimated > 0 ? "+" : ""}
              {fmt(totals.actual - totals.estimated)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};