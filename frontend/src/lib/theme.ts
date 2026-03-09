export const themeConfig = {
  themes: ['light', 'dark', 'system'] as const,
  defaultTheme: 'system' as const,
  storageKey: 'seliv-theme',
} as const;

export type Theme = (typeof themeConfig.themes)[number];
