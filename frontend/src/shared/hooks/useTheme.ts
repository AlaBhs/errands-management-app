import { useEffect, useState } from 'react';
import { userPreferencesApi } from '@/features/settings/api/userPreferences.api';
import { useAuthStore } from '@/features/auth/store/authStore';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('ey-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('ey-theme', theme);
  }, [theme]);

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);

    // Persist to DB — only when the user is authenticated
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (isAuthenticated) {
      userPreferencesApi
        .updatePreferences({
          theme: next,
          language: null,
          defaultView: null,
          disabledNotificationTypes: [],
        })
        .catch(() => {
          // Fire-and-forget — localStorage is already updated above
        });
    }
  };

  return { theme, toggle, isDark: theme === 'dark' };
}