interface PipelineTimingCardProps {
  avgQueueWaitMinutes: number | null;
  avgPickupDelayMinutes: number | null;
  avgExecutionMinutes: number | null;
  avgLifecycleMinutes: number | null;
}

const fmtMinutes = (mins: number | null): string => {
  if (mins == null) return "—";
  if (mins < 60) return `${Math.round(mins)}m`;
  return `${(mins / 60).toFixed(1)}h`;
};

// Width of each stage bar proportional to its share of total lifecycle
const barWidth = (
  mins: number | null,
  total: number | null
): string => {
  if (mins == null || total == null || total === 0) return "0%";
  return `${Math.min(Math.round((mins / total) * 100), 100)}%`;
};

interface StageProps {
  label: string;
  actor: string;
  value: string;
  width: string;
  color: string;
}

const Stage = ({ label, actor, value, width, color }: StageProps) => (
  <div className="flex-1 min-w-0">
    <div className="mb-1 flex items-center justify-between text-xs">
      <span className="font-medium truncate">{label}</span>
      <span className="ml-2 tabular-nums text-muted-foreground shrink-0">
        {value}
      </span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-2 rounded-full ${color} transition-all duration-500`}
        style={{ width }}
      />
    </div>
    <p className="mt-1 text-xs text-muted-foreground">{actor}</p>
  </div>
);

export const PipelineTimingCard = ({
  avgQueueWaitMinutes,
  avgPickupDelayMinutes,
  avgExecutionMinutes,
  avgLifecycleMinutes,
}: PipelineTimingCardProps) => {
  const total = avgLifecycleMinutes;

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-semibold">Request Pipeline Timing</h2>
        <span className="text-sm text-muted-foreground">
          Total lifecycle:{" "}
          <span className="font-medium text-foreground">
            {fmtMinutes(avgLifecycleMinutes)}
          </span>
        </span>
      </div>
      <p className="mb-6 text-xs text-muted-foreground">
        Average time a request spends in each stage. Bars are proportional
        to share of total lifecycle.
      </p>

      <div className="space-y-5">
        <Stage
          label="Queue Wait"
          actor="Admin responsibility — time to assign"
          value={fmtMinutes(avgQueueWaitMinutes)}
          width={barWidth(avgQueueWaitMinutes, total)}
          color="bg-amber-400"
        />
        <Stage
          label="Pickup Delay"
          actor="Courier responsibility — time to start"
          value={fmtMinutes(avgPickupDelayMinutes)}
          width={barWidth(avgPickupDelayMinutes, total)}
          color="bg-blue-400"
        />
        <Stage
          label="Execution"
          actor="Courier responsibility — time to complete"
          value={fmtMinutes(avgExecutionMinutes)}
          width={barWidth(avgExecutionMinutes, total)}
          color="bg-emerald-500"
        />
      </div>

      {/* Insight callout — surfaces the dominant bottleneck automatically */}
      {avgQueueWaitMinutes != null &&
        avgPickupDelayMinutes != null &&
        avgExecutionMinutes != null && (() => {
          const stages = [
            { name: "queue wait",    mins: avgQueueWaitMinutes,   actor: "admin assignment" },
            { name: "pickup delay",  mins: avgPickupDelayMinutes, actor: "courier pickup"   },
            { name: "execution",     mins: avgExecutionMinutes,   actor: "courier execution"},
          ];
          const bottleneck = stages.reduce((a, b) =>
            a.mins > b.mins ? a : b);
          const pct = total
            ? Math.round((bottleneck.mins / total) * 100)
            : 0;

          return (
            <div className="mt-6 rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Bottleneck: </span>
              {bottleneck.name} accounts for{" "}
              <span className="font-medium text-foreground">{pct}%</span> of
              total lifecycle — focus on{" "}
              <span className="font-medium text-foreground">
                {bottleneck.actor}
              </span>{" "}
              to reduce turnaround time.
            </div>
          );
        })()}
    </div>
  );
};