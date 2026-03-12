/**
 * SELIV Design System — Theme configuration
 * Updated 2026-03-10 by design-system teammate to match Figma tokens.
 *
 * The app is 100% dark-first for MVP: ThemeProvider defaults to "dark"
 * and globals.css mirrors :root and .dark to the same dark palette.
 */
export const themeConfig = {
  themes: ['dark'] as const,
  defaultTheme: 'dark' as const,
  storageKey: 'seliv-theme',
} as const;

export type Theme = (typeof themeConfig.themes)[number];

/**
 * Design token references — keep in sync with globals.css CSS variables.
 * Use these constants in JS contexts that cannot reference CSS variables
 * (e.g. canvas drawing, recharts stroke colours, etc.).
 */
export const tokens = {
  colors: {
    primary: '#7a38f5',
    primaryHover: '#672ed6',
    primaryLight: '#20133a',
    accent: '#a855f7',
    background: '#0f091c',
    card: '#1a122e',
    sidebar: '#140d24',
    foreground: '#ffffff',
    foregroundSecondary: '#9ca3af',
    muted: '#6b7280',
    border: '#2d2442',
    borderHover: '#3f325c',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  fonts: {
    sans: 'Spline Sans, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  radius: {
    sm: '6px',
    default: '8px',
    lg: '12px',
    full: '9999px',
  },
  shadows: {
    card: '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)',
    hover: '0 10px 15px -3px rgba(0,0,0,0.3)',
    dropdown: '0 20px 25px -5px rgba(0,0,0,0.4)',
    modal: '0 25px 50px -12px rgba(0,0,0,0.5)',
  },
  transition: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
} as const;
