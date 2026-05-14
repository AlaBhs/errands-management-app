import type { AiAnalysis } from "../types/operationalReport.types";

function parseAiAnalysis(raw: string | null): AiAnalysis | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AiAnalysis;
    if (
      Array.isArray(parsed.anomalies) &&
      Array.isArray(parsed.causes) &&
      Array.isArray(parsed.actions)
    )
      return parsed;
    return null;
  } catch {
    return null;
  }
}

interface Props {
  aiAnalysis: string | null;
  aiUnavailable: boolean;
}

export function ReportAiAnalysis({ aiAnalysis, aiUnavailable }: Props) {
  const parsed = !aiUnavailable ? parseAiAnalysis(aiAnalysis) : null;

  if (aiUnavailable || !parsed) {
    return (
      <div className="rounded-xl border bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
        AI analysis unavailable for this report. Metrics are still complete.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">AI Analysis</h2>

      {/* Anomalies — amber */}
      <div className="rounded-xl border-l-4 border-l-amber-400 bg-amber-50 dark:bg-amber-950/20 px-5 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Anomalies
        </p>
        <ul className="space-y-1.5">
          {parsed.anomalies.map((a, i) => (
            <li
              key={i}
              className="flex gap-2 text-sm text-amber-900 dark:text-amber-200"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              {a}
            </li>
          ))}
        </ul>
      </div>

      {/* Causes — blue */}
      <div className="rounded-xl border-l-4 border-l-blue-400 bg-blue-50 dark:bg-blue-950/20 px-5 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Possible Causes
        </p>
        <ul className="space-y-1.5">
          {parsed.causes.map((c, i) => (
            <li
              key={i}
              className="flex gap-2 text-sm text-blue-900 dark:text-blue-200"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions — cards */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recommended Actions
        </p>
        <div className="flex flex-col gap-3">
          {parsed.actions.map((action, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-4 text-sm text-foreground shadow-sm"
            >
              <span className="mr-1.5 font-semibold text-[var(--chart-1)]">
                →
              </span>
              {action}
            </div>
          ))}
        </div>
      </div>
      {/* Highlights — green, shown first */}
      {parsed.highlights?.length > 0 && (
        <div className="rounded-xl border-l-4 border-l-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Highlights
          </p>
          <ul className="space-y-1.5">
            {parsed.highlights.map((h, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-emerald-900 dark:text-emerald-200"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
