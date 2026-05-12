import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatusDistributionCardProps {
  data?: Record<string, number>;
}

const STATUS_CONFIG = {
  Pending:    { label: "Pending",     color: "bg-amber-400",   text: "text-amber-600 dark:text-amber-400",   badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400",   description: "Awaiting assignment" },
  Assigned:   { label: "Assigned",    color: "bg-violet-500",  text: "text-violet-600 dark:text-violet-400", badge: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-400", description: "Courier assigned"    },
  InProgress: { label: "In Progress", color: "bg-[var(--chart-1)]", text: "text-blue-600 dark:text-blue-400", badge: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",       description: "Being executed"      },
  Completed:  { label: "Completed",   color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400", description: "Successfully done" },
  Cancelled:  { label: "Cancelled",   color: "bg-rose-400",    text: "text-rose-500 dark:text-rose-400",     badge: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400",         description: "Cancelled requests"  },
} as const;

const ORDER = ["Completed", "InProgress", "Assigned", "Pending", "Cancelled"] as const;

export const StatusDistributionCard = ({
  data = {},
}: StatusDistributionCardProps) => {
  const total = Object.values(data).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const segments = ORDER.filter((k) => (data[k] ?? 0) > 0).map((key) => ({
    key,
    count: data[key] ?? 0,
    pct:   total > 0 ? Math.round(((data[key] ?? 0) / total) * 100) : 0,
    cfg:   STATUS_CONFIG[key],
  }));

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="mb-1 text-base font-semibold">Status Distribution</h2>
      <p className="mb-5 text-xs text-muted-foreground">
        Breakdown of all requests by current status
      </p>

      {/* ── Stacked bar ── */}
      <TooltipProvider>
        <div className="mb-6 flex h-3 w-full overflow-hidden rounded-full gap-0.5">
          {segments.map((s) => (
            <Tooltip key={s.key}>
              <TooltipTrigger asChild>
                <div
                  className={`h-full cursor-default transition-all duration-700
                              first:rounded-l-full last:rounded-r-full ${s.cfg.color}
                              hover:brightness-110`}
                  style={{ width: `${s.pct}%` }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{s.cfg.label}</p>
                <p className="text-muted-foreground">
                  {s.count} request{s.count !== 1 ? "s" : ""} · {s.pct}%
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* ── Status cards grid ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {ORDER.map((key) => {
          const count = data[key] ?? 0;
          const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
          const cfg   = STATUS_CONFIG[key];

          return (
            <div
              key={key}
              className="group flex flex-col gap-2 rounded-lg border bg-muted/30
                         p-3 transition-colors hover:bg-muted/60"
            >
              {/* Top row — dot + badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${cfg.color}`} />
                  <span className="text-xs font-medium text-muted-foreground">
                    {cfg.label}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${cfg.badge}`}
                >
                  {pct}%
                </Badge>
              </div>

              {/* Count */}
              <p className={`text-2xl font-bold tabular-nums ${cfg.text}`}>
                {count}
              </p>

              {/* Description */}
              <p className="text-[10px] text-muted-foreground leading-tight">
                {cfg.description}
              </p>

              {/* Mini progress bar */}
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-1 rounded-full transition-all duration-700 ${cfg.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};