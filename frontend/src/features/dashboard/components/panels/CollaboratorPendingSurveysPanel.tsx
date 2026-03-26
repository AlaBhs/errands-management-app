import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCheck, ClipboardList } from "lucide-react";

interface Item {
  id: string;
  title: string;
}

interface Props {
  isLoading: boolean;
  count: number;
  items: Item[];
}

export function CollaboratorPendingSurveysPanel({
  isLoading,
  count,
  items,
}: Props) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm w-full">
      <h3
        className="text-xs font-semibold uppercase tracking-wider
                     text-muted-foreground mb-4"
      >
        Pending Reviews
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
        </div>
      ) : count === 0 ? (
        <div className="text-sm text-muted-foreground">Nothing to review.</div>
      ) : (
        <div className="space-y-4">
          {/* Count Badge */}
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-foreground">
              ⭐ {count} Awaiting your feedback
            </span>
          </div>

          {/* Pending Items */}
          <div className="grid gap-2 max-h-32 overflow-y-auto">
            {items.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                to={`/requests/${item.id}`}
                className="flex items-center gap-2 truncate rounded-lg border bg-card px-3 py-1.5
                 text-xs text-muted-foreground hover:text-foreground hover:shadow-sm
                 transition-all"
                title={item.title}
              >
                <ClipboardList className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{item.title}</span>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/requests/mine?hasSurvey=false"
            className="inline-block mt-2 text-xs font-medium text-primary hover:underline"
          >
            Review now →
          </Link>
        </div>
      )}
    </div>
  );
}
