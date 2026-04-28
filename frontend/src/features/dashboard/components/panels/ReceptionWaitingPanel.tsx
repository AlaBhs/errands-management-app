import { Link }         from 'react-router-dom';
import { Skeleton }     from '@/components/ui/skeleton';
import { Package, AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { parseUtc }     from '@/shared/utils/date';
import { cn }           from '@/shared/utils/utils';

interface WaitingItem {
  id:         string;
  title:      string;
  clientName: string;
  createdAt:  string;
  isOverdue:  boolean;
}

interface Props {
  isLoading: boolean;
  items:     WaitingItem[];
  count:     number;
}

export function ReceptionWaitingPanel({ isLoading, items, count }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider
                       text-muted-foreground">
          Waiting at Reception
        </h3>
        <Link
          to="/delivery?status=HandedToReception"
          className="text-xs text-primary hover:underline"
        >
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : count === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing waiting — all clear.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/delivery/${item.id}`}
              className={cn(
                'flex items-start gap-2.5 rounded-lg border px-3 py-2',
                'text-xs transition-all hover:shadow-sm',
                item.isOverdue
                  ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800'
                  : 'border-border bg-card',
              )}
            >
              {item.isOverdue
                ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                : <Package className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
              }
              <div className="min-w-0 flex-1">
                <p className={cn(
                  'truncate font-medium',
                  item.isOverdue ? 'text-amber-700 dark:text-amber-400' : 'text-foreground',
                )}>
                  {item.title}
                </p>
                <p className="text-muted-foreground truncate">{item.clientName}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(parseUtc(item.createdAt), { addSuffix: false })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}