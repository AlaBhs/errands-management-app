import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FormSection } from '@/shared/components/FormSection';
import { FieldGroup } from '@/shared/components/FieldGroup';
import { useUpdateRequestPolicy } from '../hooks/useSystemConfig';
import { ALL_REQUEST_CATEGORIES, CATEGORY_LABELS } from '../types/systemConfig.types';
import type { RequestPolicyDto, RequestCategory } from '../types/systemConfig.types';

interface Props { initialData: RequestPolicyDto; }

const inputCls = 'w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ey-dark)]';

export function RequestPolicyForm({ initialData }: Props) {
  const { mutate, isPending } = useUpdateRequestPolicy();
  const { control, handleSubmit, reset, formState } = useForm<RequestPolicyDto>({ defaultValues: initialData });

  useEffect(() => { reset(initialData); }, [initialData, reset]);

  const toggleCategory = (
    cat: RequestCategory,
    current: RequestCategory[],
    onChange: (v: RequestCategory[]) => void,
  ) => {
    onChange(current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat]);
  };

  return (
    <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-6">
      <FormSection title="Enabled Categories">
        <p className="text-xs text-muted-foreground">At least one category must remain enabled.</p>
        <Controller name="enabledCategories" control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_REQUEST_CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={field.value.includes(cat)}
                    onChange={() => toggleCategory(cat, field.value, field.onChange)}
                    className="h-4 w-4 accent-[var(--ey-dark)]" />
                  <span className="text-sm">{CATEGORY_LABELS[cat] ?? cat}</span>
                </label>
              ))}
            </div>
          )} />
      </FormSection>

      <FormSection title="Rules">
        <div className="space-y-4">
          <Controller name="isContactPersonRequired" control={control}
            render={({ field }) => (
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={field.value} onChange={field.onChange}
                  className="h-4 w-4 accent-[var(--ey-dark)]" />
                <span className="text-sm font-medium">Contact person required on new requests</span>
              </label>
            )} />
          <FieldGroup label="Minimum Deadline Advance (hours)" htmlFor="minDeadline">
            <p className="text-xs text-muted-foreground mb-1.5">Requests must be submitted at least this many hours before the deadline.</p>
            <Controller name="minDeadlineAdvanceHours" control={control}
              render={({ field }) => (
                <input id="minDeadline" type="number" min={1} {...field}
                  onChange={(e) => field.onChange(+e.target.value)}
                  className={inputCls + ' w-32'} />
              )} />
          </FieldGroup>
        </div>
      </FormSection>

      <button type="submit" disabled={isPending || !formState.isDirty}
        className="px-5 py-2 bg-[var(--ey-dark)] text-white rounded-lg text-sm hover:bg-[var(--ey-text-hover)] transition-colors disabled:opacity-50">
        {isPending ? 'Saving…' : 'Save Request Policy'}
      </button>
    </form>
  );
}