import { Star, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  isLoading: boolean;
  avgRating?: number | null;
  completed: number;
  onTimeRate?: number | null;
}

function getRatingColor(rating?: number | null) {
  if (!rating) return "text-muted-foreground";
  if (rating >= 4.5) return "text-emerald-600";
  if (rating >= 3.5) return "text-amber-600";
  return "text-red-600";
}

function getOnTimeColor(rate?: number | null) {
  if (!rate) return "text-muted-foreground";
  if (rate >= 90) return "text-emerald-600";
  if (rate >= 75) return "text-amber-600";
  return "text-red-600";
}

export function CourierPerformancePanel({
  isLoading,
  avgRating,
  completed,
  onTimeRate,
}: Props) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm w-full">
      <h3
        className="text-xs font-semibold uppercase tracking-wider
                     text-muted-foreground mb-6"
      >
        Performance (Last 30 Days)
      </h3>

      {isLoading ? (
        <div className="flex justify-between space-x-4">
          <Skeleton className="h-20 w-20 rounded-lg" />
          <Skeleton className="h-20 w-20 rounded-lg" />
          <Skeleton className="h-20 w-20 rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Rating */}
          <div className="flex flex-col items-center justify-center p-4 bg-muted/10 rounded-lg">
            <Star className={cn("mb-2 h-6 w-6", getRatingColor(avgRating))} />
            <span
              className={cn("text-lg font-semibold", getRatingColor(avgRating))}
            >
              {avgRating != null ? avgRating.toFixed(1) : "—"}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Avg Rating
            </span>
          </div>

          {/* Completed */}
          <div className="flex flex-col items-center justify-center p-4 bg-muted/10 rounded-lg">
            <CheckCircle2 className="mb-2 h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-foreground">
              {completed}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Completed
            </span>
          </div>

          {/* On-Time Rate */}
          <div className="flex flex-col items-center justify-center p-4 bg-muted/10 rounded-lg">
            <Clock className={cn("mb-2 h-6 w-6", getOnTimeColor(onTimeRate))} />
            <span
              className={cn(
                "text-lg font-semibold",
                getOnTimeColor(onTimeRate),
              )}
            >
              {onTimeRate != null ? `${onTimeRate}%` : "—"}
            </span>
            <span className="text-xs text-muted-foreground mt-1">On-Time</span>
          </div>
        </div>
      )}
    </div>
  );
}
