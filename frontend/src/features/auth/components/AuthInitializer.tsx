import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/auth.api";
import { extractUserFromToken } from "../utils/jwtUtils";
import { PageSpinner } from "@/shared/components/PageSpinner";
import { signalr } from "@/shared/api/signalr";
import { useMessagingStore } from "@/features/messaging/store/messagingStore";
import { userPreferencesApi } from "@/features/settings/api/userPreferences.api";

export function AuthInitializer({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth, setInitializing, isInitializing } =
    useAuthStore();

  useEffect(() => {
    authApi
      .refresh()
      .then(({ accessToken }) => {
        const user = extractUserFromToken(accessToken);
        setAuth(user, accessToken);
        signalr.connect(() => useAuthStore.getState().accessToken ?? "");
        const { startConnection: startMessagingConnection } =
          useMessagingStore.getState();
        startMessagingConnection(
          () => useAuthStore.getState().accessToken ?? "",
          queryClient,
        );
        userPreferencesApi
          .getPreferences()
          .then((prefs) => {
            if (prefs.theme === "light" || prefs.theme === "dark") {
              localStorage.setItem("ey-theme", prefs.theme);
              document.documentElement.classList.remove("light", "dark");
              document.documentElement.classList.add(prefs.theme);
            }
            if (prefs?.language) {
              document.documentElement.setAttribute("lang", prefs.language);
              // A future feature might be to load language-specific resources here
              // If you use i18n (e.g. i18next): i18n.changeLanguage(prefs.language);
            }
            if (prefs.defaultView === "card" || prefs.defaultView === "table") {
              // Write into every view-mode key used across pages
              const viewKeys = [
                "collaborator-requests-view",
                "admin-requests-view",
                "courier-schedule-view",
              ];
              viewKeys.forEach((key) =>
                localStorage.setItem(key, prefs.defaultView!),
              );
            }
          })
          .catch(() => {
            // Preferences fetch failing must never block login
          });
      })
      .catch(() => {
        const { stopConnection } = useMessagingStore.getState();
        stopConnection();
        clearAuth();
      })
      .finally(() => {
        setInitializing(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isInitializing) return <PageSpinner />;

  return <>{children}</>;
}
