interface Props {
  alerts: string[];
}

export function DashboardAlerts({ alerts }: Props) {
  if (alerts.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold mb-3">Attention</h2>

      <ul className="space-y-2 text-sm">
        {alerts.map((a, i) => (
          <li key={i} className="text-amber-600">
            ⚠ {a}
          </li>
        ))}
      </ul>
    </div>
  );
}