interface CategoryBarChartProps {
  data: Record<string, number>;
}

const CATEGORY_COLORS: Record<string, string> = {
  OfficeSupplies: "bg-blue-500",
  ITEquipment: "bg-violet-500",
  Travel: "bg-amber-500",
  Facilities: "bg-emerald-500",
  Other: "bg-slate-400",
};

export const CategoryBarChart = ({ data }: CategoryBarChartProps) => {
  const total = Object.values(data).reduce((sum, v) => sum + v, 0);
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">No data available.</p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(([category, count]) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const colorClass = CATEGORY_COLORS[category] ?? "bg-slate-400";
        return (
          <div key={category}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{category}</span>
              <span className="text-muted-foreground">
                {count} ({pct}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-2 rounded-full ${colorClass} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};