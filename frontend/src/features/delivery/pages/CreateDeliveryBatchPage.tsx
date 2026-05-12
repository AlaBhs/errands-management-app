import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Package } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { FormSection } from '@/shared/components/FormSection';
import { FieldGroup } from '@/shared/components/FieldGroup';
import { useCreateDeliveryBatch } from '../hooks';
import { isApiError } from '@/shared/api/client';

export function CreateDeliveryBatchPage() {
  const navigate = useNavigate();
  const create = useCreateDeliveryBatch();

  const [form, setForm] = useState({
    title: '',
    clientName: '',
    clientPhone: '',
    pickupNote: '',
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});

  function validate(): boolean {
    const next: Partial<typeof form> = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.clientName.trim()) next.clientName = 'Client name is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    create.mutate(
      {
        title: form.title.trim(),
        clientName: form.clientName.trim(),
        clientPhone: form.clientPhone.trim() || undefined,
        pickupNote: form.pickupNote.trim() || undefined,
      },
      { onSuccess: () => navigate('/delivery') }
    );
  }

  return (
    <div className="w-full px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <PageHeader
          title="New Delivery Batch"
          subtitle="Register a physical item batch for client pickup."
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Batch Details */}
          <FormSection title="Batch Details">
            <FieldGroup label="Title" error={errors.title}>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Q1 Report Package"
                className="w-full rounded-lg border border-border bg-background
                           px-4 py-2.5 text-sm text-foreground
                           focus:border-[var(--ey-dark)] focus:outline-none
                           transition-colors"
              />
            </FieldGroup>
          </FormSection>

          {/* Client Information - now using responsive grid */}
          <FormSection title="Client Information">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FieldGroup label="Client Name" error={errors.clientName}>
                <input
                  value={form.clientName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, clientName: e.target.value }))
                  }
                  placeholder="e.g. Acme Corp"
                  className="w-full rounded-lg border border-border bg-background
                             px-4 py-2.5 text-sm text-foreground
                             focus:border-[var(--ey-dark)] focus:outline-none
                             transition-colors"
                />
              </FieldGroup>

              <FieldGroup label="Client Phone" optional>
                <input
                  value={form.clientPhone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, clientPhone: e.target.value }))
                  }
                  placeholder="+216 XX XXX XXX"
                  className="w-full rounded-lg border border-border bg-background
                             px-4 py-2.5 text-sm text-foreground
                             focus:border-[var(--ey-dark)] focus:outline-none
                             transition-colors"
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Pickup Note" optional>
              <textarea
                value={form.pickupNote}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pickupNote: e.target.value }))
                }
                rows={3}
                placeholder="Any instructions for reception..."
                className="w-full rounded-lg border border-border bg-background
                           px-4 py-2.5 text-sm text-foreground resize-none
                           focus:border-[var(--ey-dark)] focus:outline-none
                           transition-colors"
              />
            </FieldGroup>
          </FormSection>

          {/* API error */}
          {create.isError && (
            <p className="text-sm text-red-500">
              {isApiError(create.error)
                ? create.error.message
                : 'Failed to create delivery batch.'}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 py-4 border-t border-border">
            <button
              type="button"
              onClick={() => navigate('/delivery')}
              className="rounded-lg border border-border px-5 py-2.5
                         text-sm text-foreground hover:bg-muted
                         transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="flex items-center gap-2 rounded-lg
                         bg-[var(--ey-dark)] px-5 py-2.5
                         text-sm font-semibold text-white
                         hover:opacity-90 disabled:opacity-50
                         transition-opacity"
            >
              {create.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  Create Batch
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}