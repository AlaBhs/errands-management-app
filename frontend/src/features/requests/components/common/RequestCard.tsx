import { useNavigate }        from "react-router-dom";
import { Calendar, DollarSign, Tag, ArrowRight } from "lucide-react";
import { StatusBadge }        from "@/shared/components/StatusBadge";
import { PriorityBadge }      from "@/shared/components/PriorityBadge";
import { formatDate }         from "@/shared/utils/date";
import type { RequestListItemDto } from "../../types";
import type { PriorityLevel }      from "../../types";

const PRIORITY_BORDER: Record<PriorityLevel, string> = {
  Low:    "border-l-gray-300",
  Normal: "border-l-blue-400",
  High:   "border-l-orange-400",
  Urgent: "border-l-red-500",
};

interface RequestCardProps {
  request: RequestListItemDto;
}

export function RequestCard({ request }: RequestCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/requests/${request.id}`)}
      className={`group relative flex flex-col rounded-xl border-l-4
                  border border-gray-100 bg-card p-5 shadow-sm
                  transition-all duration-150 cursor-pointer
                  hover:-translate-y-0.5 hover:shadow-md
                  ${PRIORITY_BORDER[request.priority as PriorityLevel]}`}
    >
      {/* Top row — status + category */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <StatusBadge status={request.status} />
        <span className="flex items-center gap-1 text-[10px]
                         text-muted-foreground">
          <Tag className="h-3 w-3" />
          {request.category}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-foreground leading-snug
                    line-clamp-2 mb-2 flex-1">
        {request.title}
      </p>

      {/* Priority */}
      <div className="mb-3">
        <PriorityBadge priority={request.priority as PriorityLevel} />
      </div>

      {/* Footer — deadline + cost */}
      <div className="flex items-center justify-between
                      border-t border-gray-100 pt-3 mt-auto">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {request.deadline ? formatDate(request.deadline) : "No deadline"}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <DollarSign className="h-3.5 w-3.5" />
          {request.estimatedCost != null
            ? `${request.estimatedCost}`
            : "—"}
        </div>
      </div>

      {/* Hover arrow */}
      <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2
                              h-4 w-4 text-muted-foreground opacity-0
                              transition-opacity group-hover:opacity-100" />
    </div>
  );
}