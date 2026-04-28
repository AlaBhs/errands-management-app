import { Link }     from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2 } from 'lucide-react';
import { formatDate }   from '@/shared/utils/date';
import type { DeliveryBatchListItemDto } from '@/features/delivery/types/delivery.types';

interface Props {
  isLoading: boolean;
  items:     DeliveryBatchListItemDto[];
}

export function ReceptionRecentPickupsPanel({ isLoading, items }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider
                       text-muted-foreground">
          Recently Picked Up
        </h3>
        <Link
          to="/delivery?status=PickedUp"
          className="text-xs text-primary hover:underline"
        >
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pickups yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/delivery/${item.id}`}
              className="flex items-center gap-2.5 rounded-lg border border-border
                         bg-card px-3 py-2 text-xs transition-all hover:shadow-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{item.title}</p>
                <p className="text-muted-foreground truncate">{item.clientName}</p>
              </div>
              <span className="shrink-0 text-muted-foreground whitespace-nowrap">
                {formatDate(item.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}