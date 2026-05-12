import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/auth.api";
import { extractUserFromToken } from "../utils/jwtUtils";
import { PageSpinner } from "@/shared/components/PageSpinner";
import { signalr } from "@/shared/api/signalr";
import { useMessagingStore } from "@/features/messaging/store/messagingStore";
import { systemConfigApi } from "@/features/settings/api/systemConfig.api";
import { settingsKeys } from "@/features/settings/hooks/settingsKeys";
import { userPreferencesApi } from "@/features/settings/api/userPreferences.api";

export function AuthInitializer({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth, setInitializing, isInitializing } =
    useAuthStore();

  useEffect(() => {
    authApi
      .refresh()
      .then(async ({ accessToken }) => {
        // <-- added 'async' here
        const user = extractUserFromToken(accessToken);
        setAuth(user, accessToken);
        queryClient.prefetchQuery({
          queryKey: settingsKeys.publicConfig(),
          queryFn: systemConfigApi.getPublicConfig,
          staleTime: 5 * 60 * 1000,
        });
        const prefs = await userPreferencesApi
          .getPreferences()
          .catch(() => null);

        if (prefs?.theme && prefs.theme !== "system") {
          document.documentElement.classList.remove("light", "dark");
          document.documentElement.classList.add(prefs.theme);
        }

        if (prefs?.language) {
          document.documentElement.setAttribute("lang", prefs.language);
          // A future feature might be to load language-specific resources here
          // If you use i18n (e.g. i18next): i18n.changeLanguage(prefs.language);
        }

        if (prefs?.defaultView) {
          useAuthStore.getState().setDefaultView(prefs.defaultView as 'list' | 'card');
        }
        
        signalr.connect(() => useAuthStore.getState().accessToken ?? "");
        const { startConnection: startMessagingConnection } =
          useMessagingStore.getState();
        startMessagingConnection(
          () => useAuthStore.getState().accessToken ?? "",
          queryClient,
        );
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
