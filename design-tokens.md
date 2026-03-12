# SELIV Design Tokens — Extrait de Figma

---

## Couleurs

### Dark Mode (Thème principal SELIV)

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#7a38f5` | Boutons principaux, liens, accents actifs |
| `--primary-hover` | `#672ed6` | Hover sur boutons/liens primaires |
| `--primary-light` | `#20133a` | Backgrounds légers, hover subtils, selected states |
| `--secondary` | `#1a122e` | Fond cards, éléments secondaires |
| `--accent` | `#a855f7` | Badges, highlights, éléments d'attention |
| `--background` | `#0f091c` | Fond de page global |
| `--card` | `#1a122e` | Fond des cards, modals, sections |
| `--sidebar` | `#140d24` | Fond sidebar navigation |
| `--foreground` | `#ffffff` | Texte principal |
| `--foreground-secondary` | `#9ca3af` | Texte secondaire, labels, descriptions |
| `--muted` | `#6b7280` | Texte désactivé, placeholders, captions |
| `--border` | `#2d2442` | Bordures par défaut |
| `--border-hover` | `#3f325c` | Bordures au hover |
| `--success` | `#10b981` | Statuts positifs, confirmations, "Completed" |
| `--warning` | `#f59e0b` | Alertes, "In progress", attention |
| `--error` | `#ef4444` | Erreurs, suppressions, "Cancelled" |
| `--info` | `#3b82f6` | Informations, "Assigned", liens secondaires |

### Mapping statuts mission → couleurs

| Statut | Couleur | Token |
|--------|---------|-------|
| Draft | `--muted` | #6b7280 |
| Pending payment | `--warning` | #f59e0b |
| Paid | `--info` | #3b82f6 |
| Assigned | `--accent` | #a855f7 |
| In progress | `--warning` | #f59e0b |
| Completed | `--success` | #10b981 |
| Cancelled | `--error` | #ef4444 |

---

## Typographie

### Fonts

| Rôle | Font | Import |
|------|------|--------|
| Principale (UI) | **Spline Sans** | Google Fonts : `Spline+Sans:wght@400;500;600;700` |
| Monospace (code, logs, IDs) | **JetBrains Mono** | Google Fonts : `JetBrains+Mono:wght@400;500` |

### Échelle typographique

| Token | Taille | Poids | Letter-spacing | Line-height | Usage |
|-------|--------|-------|----------------|-------------|-------|
| `--h1` | 32px (2rem) | 700 (Bold) | -0.02em | 1.2 | Titres de page |
| `--h2` | 24px (1.5rem) | 600 (Semi-bold) | -0.01em | 1.3 | Titres de section |
| `--h3` | 20px (1.25rem) | 600 (Semi-bold) | normal | 1.4 | Sous-titres, titres cards |
| `--body` | 16px (1rem) | 400 (Regular) | normal | 1.5 | Texte courant |
| `--body-sm` | 14px (0.875rem) | 400 (Regular) | normal | 1.5 | Texte secondaire, tableaux |
| `--caption` | 12px (0.75rem) | 500 (Medium) | normal | 1.4 | Labels, timestamps, metadata |
| `--button` | 14px (0.875rem) | 600 (Semi-bold) | 0.01em | 1 | Texte boutons |

---

## Spacing & Radius

### Border Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius-sm` | 6px | Badges, chips, petits éléments |
| `--radius` | 8px | Boutons, inputs, selects |
| `--radius-lg` | 12px | Cards, modals, sections |
| `--radius-full` | 9999px | Avatars, pills, toggles |

### Spacing

| Token | Valeur | Usage |
|-------|--------|-------|
| `--space-xs` | 4px | Spacing interne micro (entre icône et texte) |
| `--space-sm` | 8px | Padding petit |
| `--space-md` | 12px | Gap entre petits éléments, padding badge |
| `--space-lg` | 16px | Padding cards mobile, gap moyen |
| `--space-xl` | 20px | Gap entre éléments moyens |
| `--space-2xl` | 24px | Padding cards desktop |
| `--space-3xl` | 32px | Spacing entre sections de page |
| `--space-4xl` | 48px | Spacing grandes sections (hero, etc.) |

### Padding Cards

| Contexte | Padding |
|----------|---------|
| Mobile (< 768px) | 16px |
| Desktop (≥ 768px) | 24px |

---

## Effets & Shadows

### Box Shadows

| Token | Valeur | Usage |
|-------|--------|-------|
| `--shadow-card` | `0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)` | Cards, éléments élevés |
| `--shadow-hover` | `0 10px 15px -3px rgba(0,0,0,0.3)` | Hover sur cards, éléments interactifs |
| `--shadow-dropdown` | `0 20px 25px -5px rgba(0,0,0,0.4)` | Dropdowns, popovers, selects ouverts |
| `--shadow-modal` | `0 25px 50px -12px rgba(0,0,0,0.5)` | Modals, dialogs, sheets |

### Backdrop

| Token | Valeur | Usage |
|-------|--------|-------|
| `--blur-backdrop` | `blur(8px)` | Overlay derrière modals/dialogs |

### Transitions

| Token | Valeur | Usage |
|-------|--------|-------|
| `--transition-fast` | `150ms ease` | Hover couleur, opacity |
| `--transition-normal` | `200ms ease` | Transformations, shadows |
| `--transition-slow` | `300ms ease` | Modals, slide-in, page transitions |

---

## Tailwind Config (à générer)

```javascript
// tailwind.config.ts — valeurs à injecter

const colors = {
  primary: {
    DEFAULT: '#7a38f5',
    hover: '#672ed6',
    light: '#20133a',
  },
  secondary: '#1a122e',
  accent: '#a855f7',
  background: '#0f091c',
  card: '#1a122e',
  sidebar: '#140d24',
  foreground: {
    DEFAULT: '#ffffff',
    secondary: '#9ca3af',
    muted: '#6b7280',
  },
  border: {
    DEFAULT: '#2d2442',
    hover: '#3f325c',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}

const borderRadius = {
  sm: '6px',
  DEFAULT: '8px',
  lg: '12px',
  full: '9999px',
}

const boxShadow = {
  card: '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)',
  hover: '0 10px 15px -3px rgba(0,0,0,0.3)',
  dropdown: '0 20px 25px -5px rgba(0,0,0,0.4)',
  modal: '0 25px 50px -12px rgba(0,0,0,0.5)',
}

const fontFamily = {
  sans: ['Spline Sans', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

---

## CSS Variables (à injecter dans globals.css)

```css
:root {
  /* L'app SELIV est dark-first, pas de light mode pour le MVP */
  --primary: 262 90% 59%;          /* #7a38f5 */
  --primary-hover: 262 78% 51%;    /* #672ed6 */
  --primary-light: 264 50% 15%;    /* #20133a */
  --secondary: 255 45% 12%;        /* #1a122e */
  --accent: 271 91% 65%;           /* #a855f7 */

  --background: 268 55% 7%;        /* #0f091c */
  --card: 255 45% 12%;             /* #1a122e */
  --sidebar: 264 48% 10%;          /* #140d24 */

  --foreground: 0 0% 100%;         /* #ffffff */
  --foreground-secondary: 218 11% 65%;  /* #9ca3af */
  --muted: 220 9% 46%;             /* #6b7280 */

  --border: 262 29% 20%;           /* #2d2442 */
  --border-hover: 262 29% 28%;     /* #3f325c */

  --success: 160 84% 39%;          /* #10b981 */
  --warning: 38 92% 50%;           /* #f59e0b */
  --error: 0 84% 60%;              /* #ef4444 */
  --info: 217 91% 60%;             /* #3b82f6 */

  --radius-sm: 6px;
  --radius: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  --shadow-card: 0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1);
  --shadow-hover: 0 10px 15px -3px rgba(0,0,0,0.3);
  --shadow-dropdown: 0 20px 25px -5px rgba(0,0,0,0.4);
  --shadow-modal: 0 25px 50px -12px rgba(0,0,0,0.5);
}
```

---

## Patterns Visuels

| Élément | Style |
|---------|-------|
| Cards | Fond `--card` (#1a122e), border `--border`, radius 12px, shadow-card, border 1px solid |
| Cards hover | Border → `--border-hover`, shadow → shadow-hover, transition 200ms |
| Boutons primary | Fond `--primary`, texte blanc, radius 8px, hover → `--primary-hover` |
| Boutons secondary | Fond transparent, border `--border`, texte `--foreground-secondary`, hover → fond `--primary-light` |
| Boutons ghost | Fond transparent, pas de border, hover → fond `--primary-light` |
| Inputs | Fond `--card`, border `--border`, radius 8px, focus → border `--primary` + ring 2px `--primary-light` |
| Badges | Radius 6px, padding 4px 8px, font caption, fond semi-transparent de la couleur |
| Sidebar | Fond `--sidebar`, items actifs → fond `--primary-light` + barre gauche 3px `--primary` |
| Tables | Header fond `--sidebar`, lignes alternées `--card` / `--background`, hover → `--primary-light` |
| Modals | Fond `--card`, radius 12px, shadow-modal, backdrop blur 8px + fond noir 60% opacity |
| Tooltips | Fond `--secondary`, border `--border`, radius 6px, shadow-dropdown |
| Icônes | Couleur `--foreground-secondary` par défaut, `--primary` si actif, `--accent` si highlight |
| Gradient accent | `linear-gradient(135deg, #7a38f5, #a855f7)` — pour hero CTA, badges premium |

---

*SELIV Design Tokens v1.0 — Figma Export*
