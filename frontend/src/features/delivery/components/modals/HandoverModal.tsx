import { ArrowRightCircle, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useHandoverDelivery } from '../../hooks';

interface HandoverModalProps {
  batchId:   string;
  batchTitle: string;
  onClose:   () => void;
}

export function HandoverModal({
  batchId, batchTitle, onClose,
}: HandoverModalProps) {
  const handover = useHandoverDelivery(batchId);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center
                          rounded-full bg-blue-100 dark:bg-blue-900/30">
            <ArrowRightCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-base font-semibold text-foreground">
              Hand Over to Reception
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-muted-foreground">
              Mark <span className="font-medium text-foreground">"{batchTitle}"</span> as
              handed to reception. This cannot be undone.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2.5
                       text-sm text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handover.mutate(undefined, { onSuccess: onClose })}
            disabled={handover.isPending}
            className="flex-1 flex items-center justify-center gap-2
                       rounded-lg bg-blue-600 py-2.5 text-sm font-semibold
                       text-white hover:bg-blue-700
                       disabled:opacity-50 transition-colors"
          >
            {handover.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Handing over…</>
            ) : (
              'Confirm Handover'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}