import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/shared/components/PageHeader";
import { FormSection } from "@/shared/components/FormSection";
import { useAuthStore } from "@/features/auth/store/authStore";
import {
  useUserPreferences,
  useUpdatePreferences,
} from "../hooks/useUserPreferences";
import { GeneralPreferencesForm } from "../components/GeneralPreferencesForm";
import { NotificationPreferencesForm } from "../components/NotificationPreferencesForm";
import { CollaboratorDefaultsForm } from "../components/CollaboratorDefaultsForm";
import { CourierDefaultsForm } from "../components/CourierDefaultsForm";
import type { UpdatePreferencesPayload } from "../types/userPreferences.types";
import type { UserRole } from "../types/systemConfig.types";

export function UserPreferencesPage() {
  const user = useAuthStore((s) => s.user);
  const userRole = (user?.role ?? "Collaborator") as UserRole;

  const { data: prefs, isLoading } = useUserPreferences();
  const { mutate: save, isPending } = useUpdatePreferences();

  const form = useForm<UpdatePreferencesPayload>({
    defaultValues: {
      language: null,
      theme: null,
      defaultView: null,
      disabledNotificationTypes: [],
    },
  });

  useEffect(() => {
    if (prefs) {
      form.reset({
        language: prefs.language,
        theme: prefs.theme,
        defaultView: prefs.defaultView,
        disabledNotificationTypes: prefs.disabledNotificationTypes,
      });
    }
  }, [prefs, form]);

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Loading preferences…
      </div>
    );
  }

  const maxCeiling = prefs?.courierDefaults?.maxConcurrentAssignments ?? 3;

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="My Preferences"
        subtitle="Personalise your experience. Settings are synced across all devices."
      />

      <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
        <FormSection
          title="General"
          description="Language, theme, and default view."
        >
          <GeneralPreferencesForm form={form} />
        </FormSection>
      </div>

      <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
        <FormSection
          title="Notifications"
          description="Choose which notifications to receive. Your admin may have disabled some types for your role."
        >
          <NotificationPreferencesForm form={form} userRole={userRole} />
        </FormSection>
      </div>

      {/* Shared save button for general + notifications */}
      <div className="flex justify-end">
        <button
          onClick={form.handleSubmit((v) => save(v))}
          disabled={isPending || !form.formState.isDirty}
          className="px-6 py-2.5 bg-[var(--ey-dark)] text-white rounded-lg text-sm hover:bg-[var(--ey-text-hover)] transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save Preferences"}
        </button>
      </div>

      {/* Role-specific sections — each has its own save button */}
      {userRole === "Collaborator" && prefs && (
        <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
          <FormSection
            title="Request Defaults"
            description="Pre-filled when you create a new request."
          >
            <CollaboratorDefaultsForm
              initialData={{
                defaultCategory:
                  prefs.collaboratorDefaults?.defaultCategory ?? null,
                defaultPriority:
                  prefs.collaboratorDefaults?.defaultPriority ?? null,
                defaultContactPerson:
                  prefs.collaboratorDefaults?.defaultContactPerson ?? null,
                defaultContactPhone:
                  prefs.collaboratorDefaults?.defaultContactPhone ?? null,
              }}
            />
          </FormSection>
        </div>
      )}

      {userRole === "Courier" && prefs && (
        <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
          <FormSection
            title="Courier Defaults"
            description="Base location and availability settings."
          >
            <CourierDefaultsForm
              initialData={{
                baseLatitude: prefs.courierDefaults?.baseLatitude ?? null,
                baseLongitude: prefs.courierDefaults?.baseLongitude ?? null,
                baseCity: prefs.courierDefaults?.baseCity ?? null,
                maxConcurrentAssignments:
                  prefs.courierDefaults?.maxConcurrentAssignments ?? null,
                availableDaysOfWeek:
                  prefs.courierDefaults?.availableDaysOfWeek ?? [],
                availableFromHour:
                  prefs.courierDefaults?.availableFromHour ?? null,
                availableToHour: prefs.courierDefaults?.availableToHour ?? null,
              }}
              maxConcurrentCeiling={maxCeiling}
            />
          </FormSection>
        </div>
      )}
    </div>
  );
}
