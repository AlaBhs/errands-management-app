import type { ChangelogParams } from '../types/systemConfig.types';

export const settingsKeys = {
  config:    () => ['settings', 'config'] as const,
  publicConfig: () => ['settings', 'public-config'] as const,
  changelog: (params: ChangelogParams) => ['settings', 'changelog', params] as const,
  prefs:     () => ['settings', 'preferences'] as const,
};