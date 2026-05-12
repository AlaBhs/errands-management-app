interface Props {
  data: { label: string; value: number }[];
}

export function StatusOverview({ data }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold mb-4">Status Overview</h2>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
            <div className="h-2 rounded bg-muted overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}