interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  subVariant?: "default" | "success" | "warning" | "danger";
}

const subVariantClass: Record<string, string> = {
  default: "text-muted-foreground",
  success: "text-emerald-600 font-medium",
  warning: "text-amber-500 font-medium",
  danger: "text-destructive font-medium",
};

export const KpiCard = ({
  label,
  value,
  sub,
  subVariant = "default",
}: KpiCardProps) => (
  <div className="rounded-xl border bg-card p-6 shadow-sm">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    {sub && (
      <p className={`mt-1 text-xs ${subVariantClass[subVariant]}`}>{sub}</p>
    )}
  </div>
);
