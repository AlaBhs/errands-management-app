import { useState }                  from 'react';
import { CheckCircle2, Loader2 }     from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useConfirmPickup }          from '../../hooks';
import { isApiError }                from '@/shared/api/client';

interface ConfirmPickupModalProps {
  batchId:    string;
  batchTitle: string;
  onClose:    () => void;
}

export function ConfirmPickupModal({
  batchId, batchTitle, onClose,
}: ConfirmPickupModalProps) {
  const [pickedUpBy, setPickedUpBy] = useState('');
  const confirm = useConfirmPickup(batchId);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center
                          rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-base font-semibold text-foreground">
              Confirm Pickup
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-muted-foreground">
              Confirm that{' '}
              <span className="font-medium text-foreground">"{batchTitle}"</span>{' '}
              has been picked up.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Picked up by{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              value={pickedUpBy}
              onChange={(e) => setPickedUpBy(e.target.value)}
              placeholder="Client or representative name…"
              className="w-full rounded-lg border border-border bg-background
                         px-4 py-2.5 text-sm text-foreground
                         focus:border-[var(--ey-dark)] focus:outline-none
                         transition-colors"
            />
          </div>

          {confirm.isError && (
            <p className="text-xs text-red-500">
              {isApiError(confirm.error)
                ? confirm.error.message
                : 'Failed to confirm pickup.'}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2.5
                         text-sm text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                confirm.mutate(
                  { pickedUpBy: pickedUpBy.trim() || undefined },
                  { onSuccess: onClose },
                )
              }
              disabled={confirm.isPending}
              className="flex-1 flex items-center justify-center gap-2
                         rounded-lg bg-green-600 py-2.5 text-sm font-semibold
                         text-white hover:bg-green-700
                         disabled:opacity-50 transition-colors"
            >
              {confirm.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Confirming…</>
              ) : (
                'Confirm Pickup'
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}