import { create } from 'zustand';
import type { AuthUser } from '../types';

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  defaultView: 'list' | 'card' | null;
  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  setInitializing: (value: boolean) => void;
  setDefaultView: (view: 'list' | 'card' | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
  defaultView: null, 

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),

  setInitializing: (value) => set({ isInitializing: value }),

  setDefaultView: (view) => set({ defaultView: view }),
}));