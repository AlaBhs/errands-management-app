import { useNavigate } from "react-router-dom";
import { Calendar, Tag, Zap, Play, ArrowRight, Clock } from "lucide-react";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { PriorityBadge } from "@/shared/components/PriorityBadge";
import { formatDate } from "@/shared/utils/date";
import { useStartRequest } from "../../hooks/useRequestMutations";
import { cn } from "@/shared/utils/utils";
import type { RequestListItemDto } from "../../types";
import type { PriorityLevel } from "../../types";
import { useState } from "react";
import { QuickCompleteModal } from "../modals/QuickCompleteModal";

const PRIORITY_BORDER: Record<PriorityLevel, string> = {
  Low: "border-l-gray-300 dark:border-l-gray-600",
  Normal: "border-l-blue-400 dark:border-l-blue-500",
  High: "border-l-orange-400 dark:border-l-orange-500",
  Urgent: "border-l-red-500 dark:border-l-red-500",
};

interface ScheduleCardProps {
  request: RequestListItemDto;
}

export function ScheduleCard({ request }: ScheduleCardProps) {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const navigate = useNavigate();
  const start = useStartRequest(request.id);

  const isUrgent = request.priority === "Urgent";
  const isAssigned = request.status === "Assigned";
  const isInProgress = request.status === "InProgress";
  const isCompleted = request.status === "Completed";
  const isCancelled = request.status === "Cancelled";

  const isOverdue =
    request.deadline &&
    !isCompleted &&
    !isCancelled &&
    new Date(request.deadline) < new Date();

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    start.mutate();
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCompleteModal(true);
  };

  return (
    <>
      <div
        onClick={() => navigate(`/requests/${request.id}`)}
        className={cn(
          "group relative flex flex-col rounded-xl border-l-4 border",
          "border-border bg-card p-5 shadow-sm transition-all duration-150",
          "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
          PRIORITY_BORDER[request.priority as PriorityLevel],
          // Urgent card styling (background tint + ring)
          isUrgent &&
            !isCompleted &&
            !isCancelled &&
            "bg-red-50/50 dark:bg-red-950/20 ring-1 ring-red-200 dark:ring-red-800",
          isCompleted && "opacity-60",
          isCancelled && "opacity-50 grayscale",
        )}
      >
        {/* Top row – status + urgent badge + category */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={request.status} />
            {isUrgent && !isCompleted && !isCancelled && (
              <span
                className="inline-flex items-center gap-1 rounded-full
                           bg-red-50 dark:bg-red-950/30 px-2 py-0.5
                           text-[10px] font-bold text-red-600
                           dark:text-red-400"
              >
                <Zap className="h-3 w-3" />
                Urgent
              </span>
            )}
          </div>
          <span
            className="flex items-center gap-1 text-[10px]
                       text-muted-foreground shrink-0"
          >
            <Tag className="h-3 w-3" />
            {request.category}
          </span>
        </div>

        {/* Title */}
        <p
          className="text-sm font-semibold text-foreground leading-snug
                     line-clamp-2 mb-2 flex-1"
        >
          {request.title}
        </p>

        {/* Priority badge */}
        <div className="mb-3">
          <PriorityBadge priority={request.priority as PriorityLevel} />
        </div>

        {/* Deadline / overdue */}
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs mb-4",
            isOverdue ? "text-red-500 font-medium" : "text-muted-foreground",
          )}
        >
          {isOverdue ? (
            <>
              <Clock className="h-3.5 w-3.5" /> Overdue —{" "}
              {formatDate(request.deadline!)}
            </>
          ) : (
            <>
              <Calendar className="h-3.5 w-3.5" />
              {request.deadline ? formatDate(request.deadline) : "No deadline"}
            </>
          )}
        </div>

        {/* Action buttons (if not completed/cancelled) */}
        {!isCompleted && !isCancelled && (
          <div
            className="flex gap-2 mt-auto border-t border-border pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            {isAssigned && (
              <button
                onClick={handleStart}
                disabled={start.isPending}
                className="flex flex-1 items-center justify-center gap-1.5
                           rounded-lg bg-primary px-3 py-2 text-xs
                           font-semibold text-primary-foreground
                           transition-colors hover:bg-primary/90
                           disabled:opacity-50"
              >
                {start.isPending ? (
                  <div
                    className="h-3.5 w-3.5 animate-spin rounded-full
                                border-2 border-primary-foreground/30
                                border-t-primary-foreground"
                  />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-primary-foreground" />
                )}
                {start.isPending ? "Starting…" : "Start"}
              </button>
            )}
            {isInProgress && (
              <button
                onClick={handleComplete}
                className="flex flex-1 items-center justify-center gap-1.5
                           rounded-lg bg-emerald-600 px-3 py-2 text-xs
                           font-semibold text-white transition-colors
                           hover:bg-emerald-700 dark:bg-emerald-500
                           dark:hover:bg-emerald-600"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                Complete
              </button>
            )}
          </div>
        )}

        {/* Completed checkmark */}
        {isCompleted && (
          <div
            className="flex items-center gap-1.5 mt-auto border-t
                        border-border pt-3 text-xs text-emerald-600
                        dark:text-emerald-400 font-medium"
          >
            <div
              className="flex h-4 w-4 items-center justify-center
                          rounded-full bg-emerald-100 dark:bg-emerald-900/30"
            >
              ✓
            </div>
            Completed
          </div>
        )}

        {/* Hover arrow */}
        <ArrowRight
          className="absolute right-4 top-1/2 -translate-y-1/2
                     h-4 w-4 text-muted-foreground opacity-0
                     transition-opacity group-hover:opacity-100"
        />
      </div>

      {/* Complete modal */}
      {showCompleteModal && (
        <QuickCompleteModal
          requestId={request.id}
          title={request.title}
          onClose={() => setShowCompleteModal(false)}
        />
      )}
    </>
  );
}
