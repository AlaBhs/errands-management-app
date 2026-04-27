import { useNavigate } from 'react-router-dom';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';
import { formatDate } from '@/shared/utils/date';
import type { DeliveryBatchListItemDto } from '../types/delivery.types';

interface DeliveryBatchCardProps {
  batch: DeliveryBatchListItemDto;
}

export function DeliveryBatchCard({ batch }: DeliveryBatchCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/delivery/${batch.id}`)}
      className="group relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <DeliveryStatusBadge status={batch.status} />
      </div>
      <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-2">
        {batch.title}
      </p>
      <p className="text-xs text-muted-foreground mb-3">Client: {batch.clientName}</p>
      <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
        <div className="text-xs text-muted-foreground">Created {formatDate(batch.createdAt)}</div>
      </div>
      {/* Hover arrow */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        →
      </div>
    </div>
  );
}