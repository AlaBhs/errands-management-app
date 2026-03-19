interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export const KpiCard = ({ label, value, sub }: KpiCardProps) => (
  <div className="rounded-xl border bg-card p-6 shadow-sm">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
  </div>
);