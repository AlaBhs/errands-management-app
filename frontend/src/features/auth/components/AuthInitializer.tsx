import { useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/auth.api";
import { extractUserFromToken } from "../utils/jwtUtils";
import { PageSpinner } from "@/shared/components/PageSpinner";

interface Props {
  children: ReactNode;
}

/**
 * On app startup, this component checks if there's a refresh token in the store.
 */
export default function AuthInitializer({ children }: Props) {
  const [isInitializing, setIsInitializing] = useState(true);
  const { refreshToken, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!refreshToken) {
      setIsInitializing(false);
      return;
    }

    authApi
      .refresh(refreshToken)
      .then(({ accessToken, refreshToken: newRefreshToken }) => {
        const user = extractUserFromToken(accessToken);
        setAuth(user, accessToken, newRefreshToken);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setIsInitializing(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only

  if (isInitializing) {
    return <PageSpinner />;
  }

  return <>{children}</>;
}
