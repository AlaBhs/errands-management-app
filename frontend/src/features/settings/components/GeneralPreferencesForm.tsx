import type { UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { FieldGroup } from '@/shared/components/FieldGroup';
import type { UpdatePreferencesPayload } from '../types/userPreferences.types';

const selectCls = 'w-48 px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ey-dark)]';

interface Props { form: UseFormReturn<UpdatePreferencesPayload>; }

export function GeneralPreferencesForm({ form }: Props) {
  const { control } = form;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <FieldGroup label="Language">
        <Controller name="language" control={control}
          render={({ field }) => (
            <select className={selectCls} value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value || null)}>
              <option value="">System default</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          )} />
      </FieldGroup>
      <FieldGroup label="Theme">
        <Controller name="theme" control={control}
          render={({ field }) => (
            <select className={selectCls} value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value || null)}>
              <option value="">System default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">Follow system</option>
            </select>
          )} />
      </FieldGroup>
      <FieldGroup label="Default View">
        <Controller name="defaultView" control={control}
          render={({ field }) => (
            <select className={selectCls} value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value || null)}>
              <option value="">System default</option>
              <option value="list">List</option>
              <option value="card">Card</option>
            </select>
          )} />
      </FieldGroup>
    </div>
  );
}