# SELIV — Design System Restyle Notes
**Teammate:** design-system
**Date:** 2026-03-10
**Scope:** Visual foundations only — zero React logic, hooks, routing, or API calls were modified.

---

## Summary of Changes

### 1. `tailwind.config.ts`
- Added new color tokens: `sidebar`, `success`, `warning`, `error`, `info`, `primary.light`, `border-hover`, `foreground-secondary`
- Font families: `sans` → `Spline Sans` (via `--font-spline-sans` CSS variable), `mono` → `JetBrains Mono` (via `--font-jetbrains-mono`)
- Border radius rewritten to exact Figma values: `sm=6px`, `DEFAULT=8px`, `lg=12px`, `full=9999px`
- Box shadows added: `shadow-card`, `shadow-hover`, `shadow-dropdown`, `shadow-modal`
- Transition durations added: `duration-fast=150ms`, `duration-normal=200ms`, `duration-slow=300ms`
- All existing accordion keyframes and animations preserved unchanged

### 2. `src/app/globals.css`
Completely rewritten. Key changes vs previous file:

| Variable | Before | After |
|---|---|---|
| `--background` | `0 0% 98%` (light grey) | `268 55% 7%` (deep dark violet) |
| `--foreground` | `222 47% 11%` (near black) | `0 0% 100%` (white) |
| `--card` | `0 0% 100%` (white) | `255 45% 12%` (dark violet card) |
| `--primary` | `239 84% 67%` (blue) | `262 90% 59%` (violet `#7a38f5`) |
| `--accent` | `239 84% 67%` (blue) | `271 91% 65%` (violet `#a855f7`) |
| `--border` | `220 13% 91%` (light grey) | `262 29% 20%` (dark violet border) |
| `--muted` | `210 40% 96%` (light) | `264 48% 10%` (sidebar/surface) |
| `--radius` | `0.625rem` (10px) | `0.5rem` (8px) |
| Font | `Arial, Helvetica, sans-serif` | `font-sans` (Spline Sans via CSS var) |

New variables added (not in previous file):
- `--primary-light: 264 50% 15%`
- `--border-hover: 262 29% 28%`
- `--sidebar: 264 48% 10%`
- `--foreground-secondary: 218 11% 65%`
- `--success`, `--warning`, `--error`, `--info`
- `--shadow-card`, `--shadow-hover`, `--shadow-dropdown`, `--shadow-modal`

Both `:root` and `.dark` are set to the dark palette. The `html` tag also gets `@apply dark` so shadcn/ui components always resolve to dark tokens regardless of system preference.

Custom scrollbar styles and `::selection` color added.

### 3. `src/app/layout.tsx`
- Imported `Spline_Sans` and `JetBrains_Mono` from `next/font/google`
- Font CSS variables (`--font-spline-sans`, `--font-jetbrains-mono`) applied to both `<html>` and `<body>`
- `font-sans` class on body activates Spline Sans via Tailwind

### 4. `src/components/ui/button.tsx`
| Variant | Before | After |
|---|---|---|
| `default` | `bg-primary hover:bg-primary/90` | `bg-primary hover:bg-primary/90 rounded-lg` + `font-semibold tracking-wide` |
| `destructive` | `bg-destructive hover:bg-destructive/90` | `bg-error/20 text-error hover:bg-error/30 rounded-lg` |
| `outline` | `border border-input bg-background hover:bg-accent` | `border border-border bg-transparent hover:bg-primary-light rounded-lg` |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` | `bg-transparent hover:bg-primary-light rounded-lg` |

Sizes updated: `sm` → `h-8 px-3 text-xs rounded`, `default` → `h-10 px-4 py-2 text-sm font-semibold rounded-lg`, `lg` → `h-12 px-6 text-base rounded-lg`, `icon` → `h-10 w-10 rounded-lg`.

### 5. `src/components/ui/card.tsx`
- `rounded-lg` → `rounded-xl` (12px per Figma)
- `shadow-sm` → `shadow-card`
- Added `border border-border` explicitly
- Added hover transition: `hover:border-border-hover hover:shadow-hover transition-all duration-normal`
- `CardHeader` padding: `p-6 pb-3` (was `p-6`)

### 6. `src/components/ui/input.tsx`
- `bg-background` → `bg-card`
- `border-input` → `border-border`
- `rounded-md` → `rounded-lg`
- Focus: `focus-visible:ring-ring` → `focus-visible:ring-primary/40 focus-visible:border-primary`
- Added `text-foreground` and `transition-colors duration-normal`

### 7. `src/components/ui/badge.tsx`
- Base shape: `rounded-full px-2.5` → `rounded px-2 py-0.5` (per Figma spec: 6px radius, 4/8px padding)
- `default`: was solid primary fill → now `bg-primary/20 text-primary border-primary/30`
- `destructive`: was solid red → now `bg-error/20 text-error border-error/30`
- `success`: was hard-coded `bg-green-500` → now `bg-success/20 text-success border-success/30` (uses design tokens)
- `warning`: was hard-coded `bg-yellow-500` → now `bg-warning/20 text-warning border-warning/30`

### 8. `src/components/ui/dialog.tsx`
- Overlay: `bg-black/80` → `bg-black/60 backdrop-blur-sm`
- Content: `bg-background border rounded-lg shadow-lg` → `bg-card border border-border rounded-xl shadow-modal`

### 9. `src/components/ui/select.tsx`
- Trigger: matches input style (`bg-card border-border rounded-lg focus:ring-primary/40 focus:border-primary`)
- Content: `bg-popover rounded-md shadow-md` → `bg-card rounded-xl border-border shadow-dropdown`
- Item focus: `focus:bg-accent` → `focus:bg-primary-light focus:text-foreground`
- Separator: `bg-muted` → `bg-border`

### 10. `src/components/ui/textarea.tsx`
- Same updates as Input: `bg-card`, `border-border`, `rounded-lg`, `focus-visible:ring-primary/40 focus-visible:border-primary`
- `min-h-[80px]` → `min-h-[100px]`

### 11. `src/components/ui/table.tsx`
- `TableHeader`: added `bg-sidebar` background
- `TableRow` hover: `hover:bg-muted/50` → `hover:bg-primary-light/50`
- `TableRow` selected: `data-[state=selected]:bg-muted` → `data-[state=selected]:bg-primary-light`
- `TableHead`: added `text-xs uppercase tracking-wide` for label style
- All border references updated to use `border-border`

### 12. `src/components/ui/tabs.tsx`
- `TabsList`: `bg-muted` → `bg-muted/20 border border-border rounded-lg`
- `TabsTrigger` active: `data-[state=active]:bg-background` → `data-[state=active]:bg-card`

### 13. `src/components/ui/dropdown-menu.tsx`
- Content: `bg-popover rounded-md shadow-md` → `bg-card rounded-xl border-border shadow-dropdown`
- All items focus/hover: `focus:bg-accent` → `focus:bg-primary-light focus:text-foreground`
- Separator: `bg-muted` → `bg-border`
- Label: added `text-xs uppercase tracking-wide` for section headers

### 14. `src/lib/theme.ts`
- `themes` narrowed to `['dark']` only (MVP = dark-only)
- `defaultTheme` set to `'dark'`
- Added `tokens` export with JS-accessible color/font/radius/shadow/transition values for use in canvas/chart contexts

---

## Key Tailwind Classes for Other Teammates

```
# Surfaces
bg-background          — global page background (#0f091c)
bg-card                — card/panel background (#1a122e)
bg-sidebar             — sidebar / table header (#140d24)
bg-primary-light       — hover states, active sidebar items (#20133a)

# Text
text-foreground        — primary white text
text-muted-foreground  — secondary grey text (#9ca3af)
text-primary           — violet accent text

# Borders
border-border          — default border (#2d2442)
border-border-hover    — hover border (#3f325c)

# Shadows
shadow-card            — default card shadow
shadow-hover           — card hover shadow
shadow-dropdown        — dropdown/popover shadow
shadow-modal           — dialog/modal shadow

# Semantic
text-success / bg-success    — #10b981
text-warning / bg-warning    — #f59e0b
text-error / bg-error        — #ef4444
text-info / bg-info          — #3b82f6

# Typography
font-sans              — Spline Sans (UI text)
font-mono              — JetBrains Mono (code, IDs, logs)

# Transitions
duration-fast          — 150ms
duration-normal        — 200ms
duration-slow          — 300ms

# Sidebar active item pattern
bg-primary-light border-l-[3px] border-primary

# Card hover pattern
hover:border-border-hover hover:shadow-hover transition-all duration-normal
```

---

## TODO / Known Gaps

- [ ] `toast.tsx` not updated — it currently inherits from old background/border. Recommend aligning `bg-card border-border rounded-xl` in the toast viewport/item when teammate toast is ready.
- [ ] `alert.tsx` not updated in this pass — uses `bg-background`. Should be updated to use semantic tokens (`bg-error/10`, `bg-warning/10`, etc.) in a follow-up.
- [ ] `label.tsx` not updated — no visual tokens needed, pure typography.
- [ ] Google Fonts (`Spline Sans`, `JetBrains Mono`) require internet connectivity at build time. If building offline or in a restricted CI, add `output: 'export'` font fallback or self-host the woff2 files.
- [ ] Recharts / chart components should use `tokens.colors.*` from `src/lib/theme.ts` for stroke/fill colors (cannot use CSS variables directly in SVG attributes).
- [ ] Landing page scroll animations (`whileInView`) still pending per earlier plan.
