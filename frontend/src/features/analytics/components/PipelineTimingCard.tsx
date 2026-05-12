import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface PipelineTimingCardProps {
  avgQueueWaitMinutes:   number | null;
  avgPickupDelayMinutes: number | null;
  avgExecutionMinutes:   number | null;
  avgLifecycleMinutes:   number | null;
}

const fmtMinutes = (mins: number | null): string => {
  if (mins == null) return "—";
  if (mins < 60) return `${Math.round(mins)}m`;
  return `${(mins / 60).toFixed(1)}h`;
};

const barWidth = (mins: number | null, total: number | null): string => {
  if (mins == null || total == null || total === 0) return "0%";
  return `${Math.min(Math.round((mins / total) * 100), 100)}%`;
};

interface StageProps {
  label:      string;
  actor:      string;
  value:      string;
  width:      string;
  colorBar:   string;
  colorBadge: string;
  pct:        number;
}

const Stage = ({ label, actor, value, width, colorBar, colorBadge, pct }: StageProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{actor}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tabular-nums">{value}</span>
        <Badge variant="outline" className={`text-xs ${colorBadge}`}>
          {pct}%
        </Badge>
      </div>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-2 rounded-full transition-all duration-700 ${colorBar}`}
        style={{ width }}
      />
    </div>
  </div>
);

export const PipelineTimingCard = ({
  avgQueueWaitMinutes,
  avgPickupDelayMinutes,
  avgExecutionMinutes,
  avgLifecycleMinutes,
}: PipelineTimingCardProps) => {
  const total = avgLifecycleMinutes;

  const pct = (v: number | null) =>
    v != null && total != null && total > 0
      ? Math.round((v / total) * 100)
      : 0;

  const stages = [
    { key: "queue",    mins: avgQueueWaitMinutes,   label: "Queue Wait",    actor: "Admin — time to assign courier" },
    { key: "pickup",   mins: avgPickupDelayMinutes,  label: "Pickup Delay",  actor: "Courier — time to start errand" },
    { key: "execution",mins: avgExecutionMinutes,    label: "Execution",     actor: "Courier — time to complete"     },
  ];

  const bottleneck = stages
    .filter((s) => s.mins != null)
    .reduce((a, b) => (a.mins! > b.mins! ? a : b), stages[0]);

  const bottleneckPct = pct(bottleneck.mins);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold">Request Pipeline Timing</h2>
          <p className="text-xs text-muted-foreground">
            Average time spent in each stage per request
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total lifecycle</p>
          <p className="text-lg font-bold tabular-nums">
            {fmtMinutes(avgLifecycleMinutes)}
          </p>
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-5">
        <Stage
          label="Queue Wait"
          actor="Admin — time to assign courier"
          value={fmtMinutes(avgQueueWaitMinutes)}
          width={barWidth(avgQueueWaitMinutes, total)}
          colorBar="bg-amber-400"
          colorBadge="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
          pct={pct(avgQueueWaitMinutes)}
        />
        <Stage
          label="Pickup Delay"
          actor="Courier — time to start errand"
          value={fmtMinutes(avgPickupDelayMinutes)}
          width={barWidth(avgPickupDelayMinutes, total)}
          colorBar="bg-[var(--chart-1)]"
          colorBadge="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
          pct={pct(avgPickupDelayMinutes)}
        />
        <Stage
          label="Execution"
          actor="Courier — time to complete"
          value={fmtMinutes(avgExecutionMinutes)}
          width={barWidth(avgExecutionMinutes, total)}
          colorBar="bg-emerald-500"
          colorBadge="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
          pct={pct(avgExecutionMinutes)}
        />
      </div>

      <Separator className="my-5" />

      {/* Bottleneck callout */}
      {bottleneck.mins != null && (
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center
                          rounded-full bg-amber-100 dark:bg-amber-950/50">
            <svg className="h-3 w-3 text-amber-600 dark:text-amber-400"
              fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75
                   1.334-.213 2.98-1.742 2.98H4.42c-1.53
                   0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1
                   1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-xs">
            <span className="font-semibold text-foreground">
              Bottleneck detected:
            </span>{" "}
            <span className="text-muted-foreground">
              {bottleneck.label} accounts for{" "}
              <span className="font-semibold text-foreground">
                {bottleneckPct}%
              </span>{" "}
              of the total lifecycle.{" "}
              {bottleneck.key === "queue"
                ? "Focus on faster admin assignment to reduce overall turnaround."
                : bottleneck.key === "pickup"
                  ? "Couriers are slow to start — review pickup response time."
                  : "Execution time is the main cost — consider route optimization."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};