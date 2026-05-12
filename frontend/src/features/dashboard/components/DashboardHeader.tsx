import { Link } from "react-router-dom";

interface Props {
  title: string;
  subtitle: string;
  primaryAction?: { label: string; to: string };
}

export function DashboardHeader({ title, subtitle, primaryAction }: Props) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {subtitle} · <span className="text-xs">Last 30 days</span>
        </p>
      </div>

      {primaryAction && (
        <Link
          to={primaryAction.to}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
        >
          {primaryAction.label}
        </Link>
      )}
    </div>
  );
}
