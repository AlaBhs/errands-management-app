import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FormSection } from '@/shared/components/FormSection';
import { FieldGroup } from '@/shared/components/FieldGroup';
import { useUpdateSla } from '../hooks/useSystemConfig';
import type { SlaPolicyDto } from '../types/systemConfig.types';

interface Props { initialData: SlaPolicyDto; }

const inputCls = 'w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ey-dark)]';

export function SlaPolicyForm({ initialData }: Props) {
  const { mutate, isPending } = useUpdateSla();
  const { control, handleSubmit, reset, formState } = useForm<SlaPolicyDto>({ defaultValues: initialData });

  useEffect(() => { reset(initialData); }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-6">
      <FormSection title="SLA Monitoring">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FieldGroup label="Risk Threshold (%)"
            htmlFor="riskThresholdPercent">
            <p className="text-xs text-muted-foreground mb-1.5">Alert when ≤ this % of deadline time remains.</p>
            <Controller name="riskThresholdPercent" control={control}
              render={({ field }) => (
                <input id="riskThresholdPercent" type="number" min={1} max={99} {...field}
                  onChange={(e) => field.onChange(+e.target.value)} className={inputCls} />
              )} />
          </FieldGroup>
          <FieldGroup label="Monitor Interval (minutes)" htmlFor="monitorIntervalMinutes">
            <p className="text-xs text-muted-foreground mb-1.5">How often the background job scans for at-risk requests.</p>
            <Controller name="monitorIntervalMinutes" control={control}
              render={({ field }) => (
                <input id="monitorIntervalMinutes" type="number" min={1} {...field}
                  onChange={(e) => field.onChange(+e.target.value)} className={inputCls} />
              )} />
          </FieldGroup>
          <FieldGroup label="Alert Cooldown (hours)" htmlFor="alertCooldownHours">
            <p className="text-xs text-muted-foreground mb-1.5">Minimum gap between repeat alerts for the same request.</p>
            <Controller name="alertCooldownHours" control={control}
              render={({ field }) => (
                <input id="alertCooldownHours" type="number" min={1} {...field}
                  onChange={(e) => field.onChange(+e.target.value)} className={inputCls} />
              )} />
          </FieldGroup>
        </div>
      </FormSection>

      <button type="submit" disabled={isPending || !formState.isDirty}
        className="px-5 py-2 bg-[var(--ey-dark)] text-white rounded-lg text-sm hover:bg-[var(--ey-text-hover)] transition-colors disabled:opacity-50">
        {isPending ? 'Saving…' : 'Save SLA Policy'}
      </button>
    </form>
  );
}