import { useState } from "react";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { WidgetEmptyState } from "@/features/analytics/components/WidgetEmptyState";
import {
  useOperationalReports,
  useOperationalReportById,
} from "../hooks/useOperationalReports";
import { useGenerateReport } from "../hooks/useOperationalReportMutations";
import { ReportListItem } from "../components/ReportListItem";
import { ReportMetricsCards } from "../components/ReportMetricsCards";
import { ReportAiAnalysis } from "../components/ReportAiAnalysis";
import { ReportDetailSkeleton } from "../components/skeletons/ReportDetailSkeleton";
import { OperationalDateRangeFilter } from "../components/OperationalDateRangeFilter";
import type { MetricsSnapshot } from "../types/operationalReport.types";

function parseMetrics(raw: string): MetricsSnapshot | null {
  try {
    return JSON.parse(raw) as MetricsSnapshot;
  } catch {
    return null;
  }
}

interface Props {
  initialFrom?: string;
  initialTo?: string;
}

export function OperationalReportPage({ initialFrom, initialTo }: Props) {
  const [from, setFrom] = useState<string | null>(initialFrom ?? null);
  const [to, setTo] = useState<string | null>(initialTo ?? null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reports = useOperationalReports();
  const effectiveSelectedId = selectedId ?? reports.data?.[0]?.id ?? null;
  const detail = useOperationalReportById(effectiveSelectedId);
  const generate = useGenerateReport();

  const handleGenerate = () => {
    generate.mutate(
      { from: from || null, to: to || null },
      {
        onSuccess: (res) => setSelectedId(res.data.id),
      },
    );
  };

  const metrics = detail.data
    ? parseMetrics(detail.data.metricsSnapshot)
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="border-b bg-card px-6 py-5">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Operational Reports
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              AI-powered operational reports based on pre-aggregated metrics
            </p>
          </div>

          <OperationalDateRangeFilter
            from={from}
            to={to}
            onFromChange={setFrom}
            onToChange={setTo}
            onGenerate={handleGenerate}
            isGenerating={generate.isPending}
          />
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 border-r bg-[var(--ey-aside-bg)] overflow-y-auto p-2 space-y-1">
          {reports.isLoading && (
            <div className="space-y-1 p-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg bg-[var(--ey-gray)] animate-pulse"
                />
              ))}
            </div>
          )}
          {reports.isError && (
            <p className="px-3 py-4 text-xs text-rose-400">
              Failed to load reports.
            </p>
          )}
          {reports.data?.map((r) => (
            <ReportListItem
              key={r.id}
              report={r}
              isSelected={r.id === selectedId}
              onClick={() => setSelectedId(r.id)}
            />
          ))}
          {reports.data?.length === 0 && (
            <p className="px-3 py-4 text-xs text-gray-500">No reports yet.</p>
          )}
        </aside>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {detail.isLoading && selectedId && <ReportDetailSkeleton />}
          {detail.isError && (
            <ErrorMessage message="Failed to load report details." />
          )}
          {!effectiveSelectedId && !reports.isLoading && (
            <div className="flex h-40 items-center justify-center">
              <WidgetEmptyState message="Select a report or generate a new one." />
            </div>
          )}
          {detail.data && metrics && (
            <>
              <ReportMetricsCards metrics={metrics.Summary} />
              <ReportAiAnalysis
                aiAnalysis={detail.data.aiAnalysis}
                aiUnavailable={detail.data.aiUnavailable}
              />
              <p className="text-xs text-muted-foreground border-t pt-4">
                Report covers{" "}
                <span className="font-medium">
                  {new Date(detail.data.periodFrom).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </span>
                {" → "}
                <span className="font-medium">
                  {new Date(detail.data.periodTo).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                {" · Generated "}
                {new Date(detail.data.generatedAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}