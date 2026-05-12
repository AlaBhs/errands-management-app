import { useState }           from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useCancelDelivery }  from '../../hooks';
import { isApiError }         from '@/shared/api/client';
import { cn }                 from '@/shared/utils/utils';

interface CancelDeliveryModalProps {
  batchId:    string;
  batchTitle: string;
  onClose:    () => void;
}

export function CancelDeliveryModal({
  batchId, batchTitle, onClose,
}: CancelDeliveryModalProps) {
  const [reason, setReason] = useState('');
  const cancel = useCancelDelivery(batchId);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center
                          rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-base font-semibold text-foreground">
              Cancel Delivery
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-muted-foreground">
              Cancel{' '}
              <span className="font-medium text-foreground">"{batchTitle}"</span>.
              This action cannot be undone.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Reason{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Optionally explain why you are cancelling…"
              className="w-full rounded-lg border border-border bg-background
                         px-4 py-2.5 text-sm text-foreground resize-none
                         focus:border-[var(--ey-dark)] focus:outline-none
                         transition-colors"
            />
          </div>

          {cancel.isError && (
            <p className="text-xs text-red-500">
              {isApiError(cancel.error)
                ? cancel.error.message
                : 'Failed to cancel delivery.'}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2.5
                         text-sm text-foreground hover:bg-muted transition-colors"
            >
              Keep Batch
            </button>
            <button
              onClick={() =>
                cancel.mutate(
                  { reason: reason.trim() || undefined },
                  { onSuccess: onClose },
                )
              }
              disabled={cancel.isPending}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-lg',
                'bg-red-600 dark:bg-red-700 py-2.5 text-sm font-semibold',
                'text-white hover:bg-red-700 dark:hover:bg-red-800',
                'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
              )}
            >
              {cancel.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Cancelling…</>
              ) : (
                'Cancel Delivery'
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}