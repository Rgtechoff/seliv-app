# Landing — Composants publics SELIV

Scope : teammate **landing**. Ce dossier contient tous les composants du layout public et de la landing page marketing de SELIV.

## Structure

```
src/
├── app/
│   └── (public)/
│       ├── layout.tsx          ← Layout public (server component)
│       └── page.tsx            ← Landing page (server component)
└── components/
    └── landing/
        ├── public-header.tsx   ← Header sticky (client component)
        ├── public-footer.tsx   ← Footer (server component)
        ├── hero-section.tsx    ← Section hero plein écran (server component)
        ├── how-it-works-section.tsx  ← 4 étapes (server component)
        ├── pricing-section.tsx       ← 2 plans tarifaires (server component)
        ├── testimonials-section.tsx  ← 3 témoignages (server component)
        ├── stats-section.tsx         ← 4 compteurs stats (server component)
        └── cta-section.tsx           ← CTA final (server component)
```

## Fichiers créés

### `src/app/(public)/layout.tsx`

Layout server component. Encapsule toutes les pages du groupe `(public)` avec :
- `<PublicHeader />` en haut (sticky)
- `<main>` en flex-1 pour le contenu
- `<PublicFooter />` en bas

Pas de `'use client'` : le layout est un server component pur. L'interactivité du header est déléguée au composant `PublicHeader`.

### `src/app/(public)/page.tsx`

Landing page, server component. Assemble dans l'ordre :
1. `<HeroSection />`
2. `<HowItWorksSection />`
3. `<PricingSection />`
4. `<TestimonialsSection />`
5. `<StatsSection />`
6. `<CtaSection />`

### `src/components/landing/public-header.tsx` — `'use client'`

Header sticky (`sticky top-0 z-50 bg-white shadow-sm`).

**Fonctionnalités :**
- Logo "SELIV" lien vers `/`
- Navigation desktop centrale : Accueil, Comment ça marche, Tarifs, Vendeurs
- Zone droite : si non connecté → boutons Se connecter / S'inscrire ; si connecté → `DropdownMenu` avec avatar (initiales), prénom, Mon Dashboard, Explorer les vendeurs, Déconnexion
- Mobile : bouton hamburger (`useState`) avec menu déroulant identique
- Redirection dashboard selon rôle via `ROLE_DASHBOARD` :
  - `client` → `/dashboard`
  - `vendeur` → `/vendeur/dashboard`
  - `moderateur` → `/moderateur/dashboard`
  - `admin` → `/admin/dashboard`

**Dépendances :** `useAuth`, `useState`, `next/link`, shadcn `Button`, `DropdownMenu`, lucide `Menu`, `X`, `ChevronDown`

### `src/components/landing/public-footer.tsx` — server component

Footer fond sombre (`bg-gray-900 text-white`) avec 4 colonnes :
- Logo + tagline "The Live Selling Network"
- Produit (Accueil, Comment ça marche, Tarifs, Vendeurs)
- Compte (Connexion, Inscription)
- Légal (Mentions légales, CGU, Politique de confidentialité — liens `#`)
- Copyright © 2025 SELIV

### `src/components/landing/hero-section.tsx` — server component

Section plein écran (`min-h-[calc(100vh-4rem)]`) avec gradient `from-violet-50 via-purple-50 to-white`.

**Contenu :**
- Badge "🚀 500+ lives réalisés"
- H1 : "Boostez vos ventes avec un vendeur Live professionnel"
- Sous-titre SELIV
- 2 CTAs : "Réserver un Live" (primaire → `/register`) + "Voir nos vendeurs" (outline → `/vendeurs`)
- Illustration placeholder à droite (div gradient indigo/violet avec plateformes Whatnot, TikTok, Instagram)

### `src/components/landing/how-it-works-section.tsx` — server component

Section `id="how-it-works"` avec 4 cards horizontales sur desktop (`lg:grid-cols-4`).

**Étapes :**
1. 🎯 Décrivez votre besoin — icône `Target`
2. 👤 On vous assigne un vendeur — icône `UserCheck`
3. 📺 Le live a lieu — icône `Video`
4. 💰 Récoltez les ventes — icône `TrendingUp`

### `src/components/landing/pricing-section.tsx` — server component

Section `id="pricing"` avec 2 plans côte à côte (`md:grid-cols-2`).

**Plans :**
- **Basic** (29€/mois) : 5% remise horaire, 1 live/semaine, support email — `border-2 border-gray-200`
- **Pro** (79€/mois) : 15% remise horaire, lives illimités, vendeurs Star, support prioritaire — `border-2 border-indigo-600` + badge "Populaire"

CTA "Commencer" → `/register` sur chaque plan.

### `src/components/landing/testimonials-section.tsx` — server component

3 cartes témoignages utilisant `<StarRating value={5} />` depuis `@/components/star-rating`.

**Témoignages :**
- Alice M. / Boutique Alice — ⭐×5
- Bruno L. / Bruno Commerce — ⭐×5
- Chloé R. / Mode & Style — ⭐×5

### `src/components/landing/stats-section.tsx` — server component

Bande fond sombre (`bg-indigo-700 text-white`) avec 4 compteurs en `text-4xl font-bold` :
- 500+ lives réalisés
- 150+ vendeurs actifs
- 98% satisfaction client
- 2 min temps d'assignation moyen

### `src/components/landing/cta-section.tsx` — server component

Section gradient indigo (`from-indigo-600 to-violet-700`) avec :
- H2 : "Prêt à lancer votre premier Live ?"
- Sous-titre
- Bouton blanc "Créer mon compte" → `/register`

## Règles appliquées

- TypeScript strict, zéro `any`
- `import type { ... }` pour tous les types importés
- `'use client'` uniquement sur `public-header.tsx` (utilise `useState` + `useAuth`)
- Mobile-first : breakpoints `sm:`, `md:`, `lg:` sur toutes les grilles
- `next/link` pour tous les liens internes
- Le layout `(public)/layout.tsx` est un server component pur — l'interactivité est isolée dans `PublicHeader`
