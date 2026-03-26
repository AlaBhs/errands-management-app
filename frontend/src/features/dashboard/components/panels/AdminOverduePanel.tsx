import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList } from "lucide-react";

interface OverdueItem {
  id: string;
  title: string;
  daysLate: number;
}

interface Props {
  isLoading: boolean;
  count: number;
  items: OverdueItem[];
}

export function AdminOverduePanel({ isLoading, count, items }: Props) {
  return (
    <div>
      <div className="flex justify-between" >
      <h3
        className="text-xs font-semibold uppercase tracking-wider
                     text-muted-foreground mb-4"
      >
        Overdue Requests
        
      </h3>
      <Link
            to="/requests?isOverdue=true"
            className="text-xs text-primary hover:underline block mb-4"
          >
            View all →
          </Link>
</div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : count === 0 ? (
        <p className="text-sm text-muted-foreground">No overdue requests.</p>
      ) : (
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">
            ⚠ {count} Overdue
          </div>
          <div className="grid gap-2 overflow-y-auto">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/requests/${item.id}`}
                className="flex items-center gap-2 truncate rounded-lg border bg-card px-3 py-1.5
                 text-xs text-muted-foreground hover:text-foreground hover:shadow-sm
                 transition-all"
                title={item.title}
              >
                <ClipboardList className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">
                  {item.title} — {item.daysLate}d late
                </span>
              </Link>
            ))}
          </div>
          
        </div>
      )}
    </div>
  );
}
