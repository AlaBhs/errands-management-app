import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

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
      <h3 className="text-xs font-semibold uppercase tracking-wider
                     text-muted-foreground mb-4">
        Overdue Requests
      </h3>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : count === 0 ? (
        <p className="text-sm text-muted-foreground">
          No overdue requests.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">
            ⚠ {count} Overdue
          </div>

          {items.slice(0, 3).map(item => (
            <div key={item.id}
                 className="text-xs text-muted-foreground truncate">
              › {item.title} — {item.daysLate}d late
            </div>
          ))}

          <Link
            to="/requests?isOverdue=true"
            className="text-xs text-primary hover:underline block pt-2"
          >
            View all →
          </Link>
        </div>
      )}
    </div>
  );
}