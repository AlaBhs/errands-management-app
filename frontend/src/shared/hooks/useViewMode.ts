import { useState } from 'react';
import { userPreferencesApi } from '@/features/settings/api/userPreferences.api';
import { useAuthStore } from '@/features/auth/store/authStore';

export type ViewMode = 'table' | 'card';

export function useViewMode(key = 'requests-view-mode'): [ViewMode, (m: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(key);
    return saved === 'card' ? 'card' : 'table';
  });

  const set = (m: ViewMode) => {
    localStorage.setItem(key, m);
    setMode(m);

    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (isAuthenticated) {
      userPreferencesApi
        .updatePreferences({
          defaultView: m,
          theme: null,
          language: null,
          disabledNotificationTypes: [],
        })
        .catch(() => {
        });
    }
  };

  return [mode, set];
}