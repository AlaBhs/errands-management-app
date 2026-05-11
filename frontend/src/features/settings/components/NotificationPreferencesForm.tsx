import type { UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { NOTIFICATION_TYPE_LABELS } from '../types/systemConfig.types';
import type { NotificationType, UserRole } from '../types/systemConfig.types';
import type { UpdatePreferencesPayload } from '../types/userPreferences.types';

const ROLE_TYPES: Record<UserRole, NotificationType[]> = {
  Admin:        ['RequestCreated', 'DeliveryPickedUp', 'General'],
  Collaborator: ['RequestAssigned', 'RequestStarted', 'RequestCompleted', 'RequestCancelled', 'General'],
  Courier:      ['RequestAssigned', 'General'],
  Reception:    ['DeliveryHandedToReception', 'General'],
};

interface Props {
  form:     UseFormReturn<UpdatePreferencesPayload>;
  userRole: UserRole;
}

export function NotificationPreferencesForm({ form, userRole }: Props) {
  const { control, watch } = form;
  const relevantTypes = ROLE_TYPES[userRole] ?? [];
  const disabled = watch('disabledNotificationTypes');

  if (relevantTypes.length === 0) {
    return <p className="text-sm text-muted-foreground">No notifications apply to your role.</p>;
  }

  return (
    <div className="space-y-2">
      {relevantTypes.map((type) => (
        <Controller key={type} name="disabledNotificationTypes" control={control}
          render={({ field }) => (
            <label className="flex items-center justify-between rounded-lg border border-border px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <span className="text-sm">{NOTIFICATION_TYPE_LABELS[type] ?? type}</span>
              <input
                type="checkbox"
                checked={!disabled.includes(type)}
                onChange={(e) => {
                  const current = field.value ?? [];
                  field.onChange(
                    e.target.checked
                      ? current.filter((t) => t !== type)
                      : [...current, type],
                  );
                }}
                className="h-4 w-4 accent-[var(--ey-dark)]"
              />
            </label>
          )} />
      ))}
    </div>
  );
}