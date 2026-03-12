# SELIV — Document de référence pour la refonte UX/UI

> Ce document décrit **exhaustivement** l'application SELIV : ses pages, fonctionnalités, flux utilisateurs et règles métier. Il est destiné à servir de prompt pour générer un nouveau design UX/UI complet.

---

## 1. Vue d'ensemble du produit

**SELIV** est une marketplace B2B/B2C qui met en relation des **clients** (marques, e-commerçants) avec des **vendeurs live** professionnels pour des sessions de vente en direct (live shopping sur TikTok, Instagram, etc.).

### Proposition de valeur
- Un client réserve un créneau de vente live avec un vendeur professionnel
- Le vendeur anime le live, présente et vend les produits du client
- La plateforme gère la réservation, le paiement, le chat, et le suivi

### Stack technique (pour contraintes design)
- **Frontend** : Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Palette actuelle** : Indigo/Violet avec dark mode, variables CSS custom
- **Responsive** : Mobile-first, breakpoint principal `md:` (768px)

---

## 2. Rôles utilisateurs

| Rôle | Description | Accès |
|---|---|---|
| **client** | Marque ou e-commerçant qui réserve des lives | Dashboard client, création missions, abonnement |
| **vendeur** | Vendeur live professionnel | Dashboard vendeur, missions disponibles, profil, disponibilités |
| **modérateur** | Modère les missions et le contenu | Dashboard modérateur, missions à valider |
| **admin** | Gère la plateforme opérationnellement | Toutes les missions, vendeurs, clients, facturation |
| **super_admin** | Accès technique et stratégique complet | Analytics, plans, services, configuration système |

---

## 3. Architecture des pages

### 3.1 Pages publiques (non connecté)

#### 🏠 Landing Page `/`
**Objectif** : Convertir les visiteurs en clients ou vendeurs inscrits.

**Sections (dans l'ordre) :**
1. **Header public** — Logo SELIV + navigation (Accueil, Vendeurs, Tarifs) + boutons Connexion / S'inscrire
2. **Hero Section** — Titre accrocheur, sous-titre, 2 CTA (« Je réserve un vendeur » / « Devenir vendeur »), visuel illustratif
3. **Stats Section** — 3-4 chiffres clés animés (ex : « 500+ lives réalisés », « 98% de satisfaction », « 150+ vendeurs actifs »)
4. **How It Works** — 3 étapes illustrées : 1) Choisir son vendeur → 2) Réserver et payer → 3) Live réalisé
5. **Vendeurs publics** — Aperçu de 3-4 vendeurs mis en avant (photo, spécialités, rating, prix)
6. **Pricing Section** — 3 plans tarifaires (Starter, Pro, Business) avec liste de fonctionnalités
7. **Testimonials** — Avis clients avec photo, nom, entreprise, note étoiles
8. **CTA final** — Bannière « Prêt à booster vos ventes ? » + bouton inscription
9. **Footer** — Liens légaux, réseaux sociaux, contact

**Composants clés** : `HeroSection`, `StatsSection`, `HowItWorksSection`, `PricingSection`, `TestimonialsSection`, `CtaSection`, `PublicHeader`, `PublicFooter`

---

#### 👥 Catalogue Vendeurs `/vendeurs`
**Objectif** : Permettre aux clients de découvrir et sélectionner un vendeur.

**Fonctionnalités :**
- Grille de cartes vendeurs (photo, prénom + initiale nom, bio courte, spécialités catégories, zones géographiques)
- **Filtres** : catégorie (mode, beauté, tech...), zone, niveau (débutant/confirmé/star), note minimum, tri (note, missions, récent)
- Badge ⭐ « Star » pour vendeurs premium (réservés aux abonnés Pro)
- Pagination

**Carte vendeur** (`VendeurCard`) affiche :
- Avatar (ou initiale si pas de photo)
- Prénom + initiale du nom (confidentialité)
- Niveau : `débutant` / `confirmé` / `star`
- Note moyenne (⭐ x,x)
- Nombre de missions réalisées
- Catégories de spécialité (tags)
- Zones d'intervention

---

#### 👤 Profil public vendeur `/vendeurs/[id]`
**Fonctionnalités :**
- Photo, bio complète, catégories, zones
- Calendrier de disponibilités (jours/créneaux visibles)
- Avis clients (note, commentaire, prénom client, date)
- Bouton « Réserver ce vendeur » → redirige vers création mission si connecté, sinon vers inscription

---

### 3.2 Authentification

#### 🔐 Connexion `/login`
- Formulaire email + mot de passe
- Validation Zod inline
- Redirection automatique selon le rôle après connexion :
  - `client` → `/dashboard`
  - `vendeur` → `/vendeur/dashboard`
  - `moderateur` → `/moderateur/dashboard`
  - `admin` → `/admin/dashboard`
  - `super_admin` → `/super-admin/dashboard`
- Lien « Pas encore de compte ? S'inscrire »

#### 📝 Inscription `/register`
- **Étape 1** : Choix du rôle (Client ou Vendeur) — sélection visuelle avec icône et description
- **Étape 2** : Formulaire selon rôle :
  - **Client** : Prénom, Nom, Email, Mot de passe, Nom de l'entreprise (optionnel), SIRET (optionnel)
  - **Vendeur** : Prénom, Nom, Email, Mot de passe
- Validation Zod, messages d'erreur inline
- Redirection vers `/login` après succès

---

### 3.3 Espace Client

**Layout** : Sidebar gauche (desktop), header logo + cloche notifications (mobile), bottom navigation mobile

**Navigation client** : Dashboard | Nouvelle Mission | Historique | Abonnement

---

#### 📊 Dashboard client `/dashboard`
**Fonctionnalités :**
- Section « Missions en cours » — cartes des missions actives (statuts : `pending_payment`, `paid`, `assigned`, `in_progress`)
- Section « Missions récentes » — 3 dernières missions terminées/annulées
- Bouton flottant ou CTA « Créer une nouvelle mission »
- État vide si aucune mission : illustration + bouton d'action

**Carte mission** (`MissionCard`) affiche :
- Catégorie (icône + texte)
- Date et heure du live
- Ville
- Statut avec badge coloré
- Prix total
- Nom du vendeur assigné (si applicable)
- Actions contextuelles selon statut

---

#### ➕ Nouvelle mission `/missions/new`
**Formulaire multi-étapes :**
1. **Catégorie** — Sélection parmi : mode, beauté, maison, tech, alimentation, sport, autre
2. **Détails** — Date du live, heure de début, durée (1h/2h/3h/4h), ville, adresse exacte, volume de produits
3. **Options** — Services supplémentaires (ex : équipement caméra, assistant, montage vidéo)
4. **Récapitulatif** — Décomposition du prix (prix de base + options + éventuelle réduction abonnement)
5. **Paiement** — Redirection Stripe Checkout

**Règles métier :**
- Prix complet à la commande (pas d'acompte)
- Réduction selon l'abonnement actif du client
- Transition statut : `draft` → `pending_payment` → `paid` (après Stripe)

---

#### 📋 Détail mission `/missions/[id]`
**Informations affichées :**
- Toutes les infos de la mission (date, heure, ville, adresse, catégorie, durée, volume)
- Statut actuel + timeline des statuts
- Décomposition du prix
- Vendeur assigné (prénom + initiale, niveau) si assigné
- **Chat intégré** avec le vendeur (si statut ≥ `assigned`)
- Bouton « Annuler » (si statut `paid` ou `assigned`)
- Bouton « Télécharger la facture » (si statut `completed`)
- Bouton « Laisser un avis » (si `completed` et pas encore noté)

**Chat** (`ChatWidget`) :
- Messages temps réel via WebSocket
- Envoi de messages texte
- Messages pré-définis (presets)
- ⚠️ Modération automatique : numéros de téléphone, emails, liens sociaux sont détectés et flaqués

---

#### 📜 Historique `/history`
- Liste de toutes les missions passées (terminées + annulées)
- Filtres par statut et date
- Affichage du remboursement si annulée

---

#### 💳 Abonnement `/subscription`
**Plans disponibles (gérés par super_admin) :**
- **Starter** — fonctionnalités de base, accès vendeurs débutants/confirmés
- **Pro** — accès vendeurs Star, réductions sur les missions
- **Business** — tarifs négociés, support prioritaire

**Fonctionnalités :**
- Plan actuel affiché avec date de renouvellement
- Bouton « Upgrader » → Stripe Billing Portal
- Historique des paiements

---

#### 🚀 Onboarding client `/onboarding`
- Flux de première utilisation après inscription
- Guide pas à pas : compléter son profil → créer sa première mission

---

### 3.4 Espace Vendeur

**Layout** : Sidebar gauche (desktop), header logo + cloche (mobile), bottom navigation mobile

**Navigation vendeur** : Dashboard | Missions | Disponibilités | Profil

---

#### 📊 Dashboard vendeur `/vendeur/dashboard`
**Fonctionnalités :**
- Alerte si profil non validé par un admin
- Badge ⭐ si vendeur Star
- **KPIs** : missions actives, lives à venir, missions terminées
- Section « Missions assignées » — lives du vendeur en cours ou à venir
- CTA vers les missions disponibles

---

#### 🔍 Missions disponibles `/vendeur/missions`
- Liste des missions `paid` non encore assignées
- Filtre par catégorie, ville, date
- **Bouton « Postuler »** sur chaque mission (le vendeur accepte la mission)
- Affichage du prix de la mission, catégorie, ville, date

---

#### 📋 Détail mission vendeur `/vendeur/missions/[id]`
- Informations complètes de la mission
- ⚠️ **JAMAIS l'adresse exacte ni le contact client avant assignation**
- Après acceptation : adresse complète + chat activé
- Bouton « Marquer comme terminé » (quand le live est fait)

---

#### 📅 Disponibilités `/vendeur/disponibilites`
**Interface de planning :**
- Calendrier hebdomadaire (jours de semaine + créneaux horaires)
- Ajout/suppression de créneaux récurrents (ex : tous les lundis 14h-17h)
- Dates spécifiques (exceptions ponctuelles)
- Ces données alimentent le profil public du vendeur

---

#### 👤 Profil `/vendeur/profil`
**Sections éditables :**
- Photo de profil (upload)
- Bio (texte libre, 500 caractères)
- Catégories de spécialité (multi-sélection)
- Zones d'intervention (villes/régions)
- Liens réseaux sociaux (Instagram, TikTok)
- Informations bancaires (IBAN pour virements)

---

#### 🚀 Onboarding vendeur `/vendeur/onboarding`
- Complétion guidée du profil
- Upload de documents justificatifs (identité, KBIS si applicable)
- Soumission pour validation admin

---

### 3.5 Espace Modérateur

**Layout** : Sidebar desktop + hamburger drawer mobile

**Navigation** : Dashboard | Missions

---

#### 📊 Dashboard modérateur `/moderateur/dashboard`
- Vue d'ensemble des missions à modérer
- Messages flagués en attente de décision
- KPIs : missions en attente, messages suspects

---

#### 📋 Missions `/moderateur/missions` et `/moderateur/missions/[id]`
- Liste des missions signalées ou en litige
- Outils de modération : approuver, rejeter, commenter
- Historique des actions de modération

---

### 3.6 Espace Admin

**Layout** : Sidebar desktop (w-56) + hamburger drawer mobile

**Navigation** : Dashboard | Missions | Vendeurs | Clients | Facturation | Abonnements | Modération Chat

---

#### 📊 Dashboard admin `/admin/dashboard`
**KPIs (4 cartes) :**
- Total missions
- En attente de paiement
- Lives en cours aujourd'hui
- Chiffre d'affaires total (en €)

**Graphiques (Recharts) :**
- **Bar chart** : Missions par statut
- **Area chart** : Revenus des 6 derniers mois

**Section** : Lives du jour (liste avec heure, vendeur, client, statut, bouton action)

---

#### 📋 Missions admin `/admin/missions` et `/admin/missions/[id]`
- Toutes les missions de la plateforme
- Filtres : statut, date, vendeur, client
- Action **« Assigner un vendeur »** (dropdown de vendeurs disponibles) sur missions `paid`
- Action **« Changer le statut »** manuellement
- Export CSV de toutes les missions

---

#### 👥 Vendeurs admin `/admin/vendeurs`
- Liste de tous les vendeurs
- Actions : **Valider** un vendeur (rend son profil public), **Toggle Star** (activer/désactiver le badge star)
- Filtres : validé, star, niveau

---

#### 👤 Clients admin `/admin/clients`
- Liste de tous les clients
- Historique des missions par client
- Informations de facturation

---

#### 💰 Facturation `/admin/facturation`
- Liste de toutes les transactions
- Détail des paiements Stripe (montant, statut, date)
- Remboursements effectués

---

#### 📦 Abonnements `/admin/abonnements`
- Abonnements actifs par client
- Plan, date de souscription, date de renouvellement, statut

---

#### 💬 Modération chat `/admin/chat-moderation`
- Messages flagués par le système (numéros, emails, liens)
- Actions : **Approuver** (rendre visible) | **Supprimer**
- Contexte de la conversation (mission ID, interlocuteurs)

---

### 3.7 Espace Super Admin

**Layout** : Sidebar desktop (w-64) + hamburger drawer mobile. Badge rouge « SUPER » dans le logo.

**Navigation** : Dashboard | Vendeurs | Clients | Missions | Plans & Abonnements | Services & Options | Activity Log | Configuration

---

#### 📊 Dashboard super admin `/super-admin/dashboard`
**KPIs système :**
- Utilisateurs totaux (clients + vendeurs)
- Missions totales
- Revenus totaux
- Abonnements actifs

**Graphiques :**
- **Line chart** : Revenus mensuels (12 mois)
- **Bar chart** : Missions créées par mois

**Section** : Dernières activités (5 derniers logs)

---

#### 👥 Vendeurs super admin `/super-admin/vendeurs`
**Table avec colonnes :** Prénom, Email, Niveau, Note, Missions, Statut, Étoile, Actions

**Actions par vendeur :**
- **Suspendre** (avec motif) / **Lever la suspension**
- **Toggle Star** (accès réservé Pro)
- **Changer le niveau** : débutant → confirmé → star
- **Modifier la commission** (taux %)

**Détail vendeur** `/super-admin/vendeurs/[id]` :
- Profil complet
- Historique des missions
- Statistiques de performance
- Journal des actions admin

---

#### 👤 Clients super admin `/super-admin/clients`
**Table avec colonnes :** Prénom, Email, Entreprise, Plan, Missions, Segment, Statut, Actions

**Segments** : Bronze / Silver / Gold / VIP (selon activité)

**Actions :**
- **Suspendre** / **Lever la suspension**
- **Ajouter une note** interne
- **Changer de segment**

**Détail client** `/super-admin/clients/[id]` :
- Profil complet
- Historique des missions et paiements
- Notes internes
- Abonnement actuel

---

#### 📋 Missions super admin `/super-admin/missions`
- Vue globale de toutes les missions
- Filtres par statut (chips cliquables en haut)
- Recherche par ID, ville, catégorie
- Export CSV
- Tableau : ID, Date, Ville, Catégorie, Statut, Vendeur, Total, Créée le

---

#### 💳 Plans & Abonnements `/super-admin/plans`
**CRUD complet avec drag-and-drop pour réordonner**

**Champs d'un plan :**
- Nom, Slug (identifiant technique)
- Description
- Prix mensuel (en centimes → affiché en €)
- Liste de fonctionnalités (texte ligne par ligne)
- Accès aux vendeurs Star (oui/non)
- Réduction sur les missions (%)
- Nombre d'abonnés actuels (affiché, non éditable)
- Ordre d'affichage
- Actif / Inactif

**Aperçu live** : En créant/éditant un plan, prévisualisation de la carte pricing en temps réel.

---

#### 🛠️ Services & Options `/super-admin/services`
**CRUD des options disponibles à la création de mission**

**Champs d'un service :**
- Nom, Description
- Catégorie (applicable à quelles catégories de lives)
- Prix (en centimes)
- Durée additionnelle (minutes)
- Actif / Inactif
- Ordre d'affichage

---

#### 📜 Activity Log `/super-admin/activity-log`
- Journal de toutes les mutations (POST/PUT/PATCH/DELETE)
- **Colonnes** : Date/heure, Action (badge coloré), Acteur (ID+rôle), Cible (type+ID), IP, Détails (JSON dépliable)
- **Filtres** : Par action, par acteur
- **Recherche** : libre dans les logs
- **Pagination curseur** : chargement progressif (50 entrées par page)
- **Export CSV** de tout le journal

**Actions loguées** : plan_created, plan_updated, plan_deleted, service_created, service_updated, service_deleted, user_suspended, user_unsuspended, user_updated, mission_created, mission_updated

---

#### ⚙️ Configuration `/super-admin/configuration`
Affichage des règles métier système (lecture seule) :
- Politique d'annulation (48h)
- Tarification et commissions
- Accès et rôles
- Services email et notifications
- Machine d'états des missions

---

## 4. Composants transversaux

### Navigation mobile (tous espaces connectés)
- **Client & Vendeur** : Bottom navigation fixe (4 items, icônes + labels)
- **Admin, Modérateur, Super Admin** : Hamburger → slide-over drawer (framer-motion)

### Header mobile (client & vendeur)
- Logo SELIV (gauche)
- Cloche de notifications avec badge rouge si non lu (droite)

### Cloche notifications (`NotificationBell`)
- Badge rouge avec compteur sur les notifications non lues
- Dropdown au clic : liste des dernières notifications
- Types : mission assignée, live dans 2h, avis reçu, paiement confirmé, remboursement

### Chat (`ChatWidget`)
- Messages en temps réel (WebSocket Socket.io)
- Bulles de messages (gauche = vendeur, droite = client)
- Input texte + bouton envoi
- Section « Presets » : messages prédéfinis par catégorie
- ⚠️ Les messages contenant numéros, emails ou liens sociaux sont **automatiquement flagués** (mais visibles avec avertissement)

### Badge statut mission (`StatusBadge`)
| Statut | Couleur | Label FR |
|---|---|---|
| `draft` | Gris | Brouillon |
| `pending_payment` | Jaune | En attente de paiement |
| `paid` | Bleu | Payée |
| `assigned` | Violet | Assignée |
| `in_progress` | Orange | En cours |
| `completed` | Vert | Terminée |
| `cancelled` | Rouge | Annulée |

### Décomposition prix (`PriceBreakdown`)
- Prix de base
- Prix des options
- Réduction abonnement (si applicable)
- **Total** (en gras)

---

## 5. Règles métier critiques à respecter dans le design

1. **Confidentialité** : L'adresse complète du client et son contact ne doivent JAMAIS apparaître dans l'espace vendeur avant assignation officielle
2. **Paiement** : Toujours complet à la commande — pas d'affichage d'acompte
3. **Annulation** :
   - ≥ 48h avant le live → badge « Remboursement 100% »
   - < 48h avant le live → badge « Remboursement 50% »
   - Live en cours → annulation impossible (bouton grisé)
4. **Vendeur Star** : Toujours accompagné d'un indicateur « Réservé aux abonnés Pro »
5. **Prix** : Toujours affichés en euros (€), stockés en centimes en base

---

## 6. Flux utilisateurs principaux

### Flux Client — Créer et suivre une mission
```
Landing → Inscription → Onboarding → Dashboard
→ Nouvelle Mission (formulaire) → Paiement Stripe
→ Attente assignation vendeur → Chat activé
→ Live réalisé → Avis + Facture
```

### Flux Vendeur — Accepter et réaliser un live
```
Inscription → Onboarding (docs) → Validation admin
→ Dashboard vendeur → Missions disponibles
→ Accepter une mission → Accès adresse + Chat
→ Réaliser le live → Marquer terminé → Paiement reçu
```

### Flux Admin — Gérer les opérations
```
Dashboard → Voir missions paid → Assigner un vendeur
→ Surveiller les lives en cours → Modérer les chats flagués
→ Valider nouveaux vendeurs → Gérer remboursements
```

### Flux Super Admin — Piloter la plateforme
```
Dashboard analytics → Gérer les plans tarifaires
→ Configurer le catalogue services
→ Surveiller vendeurs (performance, niveau, étoile)
→ Gérer les clients VIP → Consulter activity log
```

---

## 7. États vides et cas limites (à designer)

- **Dashboard sans missions** : illustration + CTA « Créer votre première mission »
- **Catalogue vendeurs sans résultats** : message + suggestion de modifier les filtres
- **Chat avant assignation** : placeholder « Le chat sera disponible une fois un vendeur assigné »
- **Vendeur non validé** : bannière d'alerte sur son dashboard
- **Abonnement expiré** : popup de renouvellement sur les actions Pro
- **Mission annulée** : affichage du remboursement avec délai estimé
- **Paiement échoué** : page d'erreur avec bouton « Réessayer »

---

## 8. Données de référence (pour les maquettes)

### Catégories de lives
`Mode`, `Beauté`, `Maison & Déco`, `Tech & Électronique`, `Alimentation & Épicerie`, `Sport & Outdoor`, `Bijoux & Accessoires`, `Autre`

### Volumes de produits
`Petit (< 20 produits)`, `Moyen (20-50)`, `Grand (50-100)`, `Très grand (100+)`

### Durées disponibles
`1h`, `2h`, `3h`, `4h`

### Niveaux vendeurs
- **Débutant** — moins de 10 lives réalisés
- **Confirmé** — 10 à 49 lives réalisés
- **Star** — 50+ lives, sélection manuelle, accès réservé Pro

### Plans tarifaires (exemple)
| Plan | Prix | Cible |
|---|---|---|
| Starter | 0€/mois | Découverte, vendeurs débutants/confirmés |
| Pro | 49€/mois | Accès Star, -10% sur les missions |
| Business | 149€/mois | Volume, support dédié, tarifs négociés |

---

## 9. Prompt de design suggéré

> **Contexte** : Refonte complète UX/UI de SELIV, une marketplace de live shopping B2B/B2C française. Stack : Next.js 14, Tailwind CSS, shadcn/ui, Framer Motion.
>
> **Cible** : 2 personas principaux :
> - **Client** (marque/e-commerçant) : 28-45 ans, habitué aux outils SaaS, veut de l'efficacité et de la transparence
> - **Vendeur live** : 20-35 ans, créateur de contenu, mobile-first, veut voir ses missions et son agenda rapidement
>
> **Ton visuel** : Professionnel mais dynamique, moderne sans être austère. L'univers du live shopping est coloré et énergique.
>
> **Contraintes** :
> - Dark mode obligatoire (toggle en header)
> - Mobile-first avec bottom navigation pour client et vendeur
> - Animations légères (Framer Motion) : transitions de page, entrées de cartes en stagger, hover effects
> - Accessibilité : contrastes WCAG AA minimum
>
> **À designer** : [choisir parmi les 38 pages décrites ci-dessus]
