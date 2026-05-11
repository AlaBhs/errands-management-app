import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FieldGroup } from '@/shared/components/FieldGroup';
import { useUpdateCollaboratorDefaults } from '../hooks/useUserPreferences';
import { ALL_REQUEST_CATEGORIES, CATEGORY_LABELS } from '../types/systemConfig.types';
import { ALL_PRIORITY_LEVELS } from '../types/userPreferences.types';
import type { UpdateCollaboratorDefaultsPayload } from '../types/userPreferences.types';

interface Props { initialData: UpdateCollaboratorDefaultsPayload; }

const inputCls = 'w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ey-dark)]';
const selectCls = inputCls;

export function CollaboratorDefaultsForm({ initialData }: Props) {
  const { mutate, isPending } = useUpdateCollaboratorDefaults();
  const { control, handleSubmit, reset, formState } = useForm<UpdateCollaboratorDefaultsPayload>({ defaultValues: initialData });

  useEffect(() => { reset(initialData); }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldGroup label="Default Category">
          <Controller name="defaultCategory" control={control}
            render={({ field }) => (
              <select className={selectCls} value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || null)}>
                <option value="">None</option>
                {ALL_REQUEST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
                ))}
              </select>
            )} />
        </FieldGroup>
        <FieldGroup label="Default Priority">
          <Controller name="defaultPriority" control={control}
            render={({ field }) => (
              <select className={selectCls} value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || null)}>
                <option value="">None</option>
                {ALL_PRIORITY_LEVELS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            )} />
        </FieldGroup>
        <FieldGroup label="Default Contact Person">
          <Controller name="defaultContactPerson" control={control}
            render={({ field }) => (
              <input type="text" placeholder="Name" className={inputCls}
                value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || null)} />
            )} />
        </FieldGroup>
        <FieldGroup label="Default Contact Phone">
          <Controller name="defaultContactPhone" control={control}
            render={({ field }) => (
              <input type="tel" placeholder="+216 XX XXX XXX" className={inputCls}
                value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || null)} />
            )} />
        </FieldGroup>
      </div>

      <button type="submit" disabled={isPending || !formState.isDirty}
        className="px-5 py-2 bg-[var(--ey-dark)] text-white rounded-lg text-sm hover:bg-[var(--ey-text-hover)] transition-colors disabled:opacity-50">
        {isPending ? 'Saving…' : 'Save Request Defaults'}
      </button>
    </form>
  );
}