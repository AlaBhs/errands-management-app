import { useState } from "react";
import { useUpdateNotificationPolicy } from "../hooks/useSystemConfig";
import {
  ALL_NOTIFICATION_TYPES,
  ALL_ROLES,
  NOTIFICATION_TYPE_LABELS,
} from "../types/systemConfig.types";
import type {
  NotificationPolicyDto,
  NotificationType,
  UserRole,
} from "../types/systemConfig.types";

interface Props {
  initialData: NotificationPolicyDto;
}

function buildMatrix(
  data: NotificationPolicyDto,
): Record<NotificationType, Set<UserRole>> {
  return Object.fromEntries(
    ALL_NOTIFICATION_TYPES.map((t) => [
      t,
      new Set<UserRole>(data.disabledTypesByRole[t] ?? []),
    ]),
  ) as Record<NotificationType, Set<UserRole>>;
}

export function NotificationPolicyForm({ initialData }: Props) {
  const { mutate, isPending } = useUpdateNotificationPolicy();

  const [matrix, setMatrix] = useState(() => buildMatrix(initialData));
  const [isDirty, setIsDirty] = useState(false);

 const toggle = (type: NotificationType, role: UserRole) => {
  setMatrix((prev) => {
    const next = {
      ...prev,
      [type]: new Set(prev[type]),
    };

    if (next[type].has(role)) {
      next[type].delete(role);
    } else {
      next[type].add(role);
    }

    return next;
  });

  setIsDirty(true);
};

  const handleSave = () => {
    const disabledTypesByRole: Partial<Record<NotificationType, UserRole[]>> =
      {};
    for (const type of ALL_NOTIFICATION_TYPES) {
      const disabled = [...matrix[type]];
      if (disabled.length > 0) disabledTypesByRole[type] = disabled;
    }
    mutate({ disabledTypesByRole });
    setIsDirty(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Toggle <strong>off</strong> to prevent a role from receiving that
        notification type. This overrides individual user preferences.
      </p>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-foreground">
                Notification
              </th>
              {ALL_ROLES.map((role) => (
                <th
                  key={role}
                  className="px-4 py-3 text-center font-medium text-foreground"
                >
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ALL_NOTIFICATION_TYPES.map((type) => (
              <tr key={type} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">
                  {NOTIFICATION_TYPE_LABELS[type] ?? type}
                </td>
                {ALL_ROLES.map((role) => {
                  const enabled = !matrix[type].has(role);
                  return (
                    <td key={role} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => toggle(type, role)}
                        className="h-4 w-4 accent-[var(--ey-dark)] cursor-pointer"
                        aria-label={`${NOTIFICATION_TYPE_LABELS[type]} for ${role}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleSave}
        disabled={isPending || !isDirty}
        className="px-5 py-2 bg-[var(--ey-dark)] text-white rounded-lg text-sm hover:bg-[var(--ey-text-hover)] transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save Notification Policy"}
      </button>
    </div>
  );
}
