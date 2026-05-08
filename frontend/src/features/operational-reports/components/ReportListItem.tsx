import { cn } from "@/shared/utils/utils";
import type { OperationalReportSummary } from "../types/operationalReport.types";

interface Props {
  report: OperationalReportSummary;
  isSelected: boolean;
  onClick: () => void;
}

export function ReportListItem({ report, isSelected, onClick }: Props) {
  const generatedAt = new Date(report.generatedAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const from = new Date(report.periodFrom).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short",
  });
  const to = new Date(report.periodTo).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg px-3 py-2.5 transition-colors flex flex-col gap-1",
        isSelected
          ? "bg-[var(--ey-yellow)] text-[var(--ey-dark)]"
          : "text-gray-400 hover:bg-[var(--ey-gray)] hover:text-white",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold truncate">{generatedAt}</span>
        {report.aiUnavailable ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 shrink-0">
            No AI
          </span>
        ) : (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 shrink-0">
            AI
          </span>
        )}
      </div>
      <span className="text-xs opacity-70">
        {from} → {to}
      </span>
    </button>
  );
}