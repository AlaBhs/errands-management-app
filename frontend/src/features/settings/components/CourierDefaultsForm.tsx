import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FieldGroup } from '@/shared/components/FieldGroup';
import { AddressMapPicker } from '@/shared/components/AddressMapPicker';
import { useUpdateCourierDefaults } from '../hooks/useUserPreferences';
import { ALL_DAYS } from '../types/userPreferences.types';
import type { UpdateCourierDefaultsPayload, DayOfWeek } from '../types/userPreferences.types';

interface Props {
  initialData:          UpdateCourierDefaultsPayload;
  maxConcurrentCeiling: number;
}

const inputCls = 'w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ey-dark)]';

export function CourierDefaultsForm({ initialData, maxConcurrentCeiling }: Props) {
  const { mutate, isPending } = useUpdateCourierDefaults();
  const { control, handleSubmit, reset, setValue, formState } = useForm<UpdateCourierDefaultsPayload>({ defaultValues: initialData });

  useEffect(() => { reset(initialData); }, [initialData, reset]);

  const toggleDay = (day: DayOfWeek, current: DayOfWeek[], onChange: (v: DayOfWeek[]) => void) => {
    onChange(current.includes(day) ? current.filter((d) => d !== day) : [...current, day]);
  };

  return (
    <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-6">
      <FieldGroup label="Base Location">
        <p className="text-xs text-muted-foreground mb-2">Used as your starting point for proximity scoring.</p>
        <Controller name="baseLatitude" control={control}
          render={({ field: latField }) => (
            <Controller name="baseLongitude" control={control}
              render={({ field: lngField }) => (
                <AddressMapPicker
                  latitude={latField.value ?? undefined}
                  longitude={lngField.value ?? undefined}
                  onCoordinatesChange={(lat, lng) => {
                    latField.onChange(lat);
                    lngField.onChange(lng);
                  }}
                  onAddressChange={(addr) => {
                    if (addr.city) setValue('baseCity', addr.city);
                  }}
                />
              )} />
          )} />
      </FieldGroup>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldGroup label="Base City">
          <Controller name="baseCity" control={control}
            render={({ field }) => (
              <input type="text" placeholder="e.g. Tunis" className={inputCls}
                value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || null)} />
            )} />
        </FieldGroup>
        <FieldGroup label={`Max Concurrent Assignments (system max: ${maxConcurrentCeiling})`}>
          <Controller name="maxConcurrentAssignments" control={control}
            render={({ field }) => (
              <input type="number" min={1} max={maxConcurrentCeiling} className={inputCls + ' w-24'}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value === '' ? null : +e.target.value)} />
            )} />
        </FieldGroup>
      </div>

      <FieldGroup label="Available Days">
        <Controller name="availableDaysOfWeek" control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-3">
              {ALL_DAYS.map((day) => (
                <label key={day} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={field.value.includes(day)}
                    onChange={() => toggleDay(day, field.value, field.onChange)}
                    className="h-4 w-4 accent-[var(--ey-dark)]" />
                  <span className="text-sm">{day.slice(0, 3)}</span>
                </label>
              ))}
            </div>
          )} />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-5">
        <FieldGroup label="Available From (hour)">
          <Controller name="availableFromHour" control={control}
            render={({ field }) => (
              <input type="number" min={0} max={23} className={inputCls + ' w-24'}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value === '' ? null : +e.target.value)} />
            )} />
        </FieldGroup>
        <FieldGroup label="Available To (hour)">
          <Controller name="availableToHour" control={control}
            render={({ field }) => (
              <input type="number" min={0} max={23} className={inputCls + ' w-24'}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value === '' ? null : +e.target.value)} />
            )} />
        </FieldGroup>
      </div>

      <button type="submit" disabled={isPending || !formState.isDirty}
        className="px-5 py-2 bg-[var(--ey-dark)] text-white rounded-lg text-sm hover:bg-[var(--ey-text-hover)] transition-colors disabled:opacity-50">
        {isPending ? 'Saving…' : 'Save Courier Defaults'}
      </button>
    </form>
  );
}