import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FormSection } from '@/shared/components/FormSection';
import { FieldGroup } from '@/shared/components/FieldGroup';
import { useUpdateExpense } from '../hooks/useSystemConfig';
import { ALL_REQUEST_CATEGORIES, CATEGORY_LABELS } from '../types/systemConfig.types';
import type { ExpensePolicyDto, RequestCategory } from '../types/systemConfig.types';

interface Props { initialData: ExpensePolicyDto; }

const inputCls = 'w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ey-dark)]';

export function ExpensePolicyForm({ initialData }: Props) {
  const { mutate, isPending } = useUpdateExpense();
  const { control, handleSubmit, reset, formState } = useForm<ExpensePolicyDto>({ defaultValues: initialData });

  useEffect(() => { reset(initialData); }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-6">
      <FormSection title="Overrun Flag">
        <FieldGroup label="Overrun Flag Threshold (%)" htmlFor="overrun">
          <p className="text-xs text-muted-foreground mb-1.5">Flag an expense when actual cost exceeds estimated by this percentage.</p>
          <Controller name="overrunFlagThresholdPercent" control={control}
            render={({ field }) => (
              <input id="overrun" type="number" min={0} max={100} {...field}
                onChange={(e) => field.onChange(+e.target.value)}
                className={inputCls + ' w-32'} />
            )} />
        </FieldGroup>
      </FormSection>

      <FormSection title="Category Budget Caps">
        <p className="text-xs text-muted-foreground">Leave blank for no cap on that category.</p>
        <div className="rounded-lg border border-border divide-y divide-border">
          {ALL_REQUEST_CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium">{CATEGORY_LABELS[cat] ?? cat}</span>
              <Controller
                name={`categoryBudgetCaps.${cat}` as `categoryBudgetCaps.${RequestCategory}`}
                control={control}
                render={({ field }) => (
                  <input type="number" min={0} step="0.01" placeholder="No cap"
                    className="w-36 px-3 py-1.5 border border-border rounded-lg text-sm text-right bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ey-dark)]"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                )} />
            </div>
          ))}
        </div>
      </FormSection>

      <button type="submit" disabled={isPending || !formState.isDirty}
        className="px-5 py-2 bg-[var(--ey-dark)] text-white rounded-lg text-sm hover:bg-[var(--ey-text-hover)] transition-colors disabled:opacity-50">
        {isPending ? 'Saving…' : 'Save Expense Policy'}
      </button>
    </form>
  );
}