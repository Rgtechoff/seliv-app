# SELIV — Projet Context

## Stack
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Backend: NestJS, TypeScript, TypeORM
- DB: PostgreSQL 16
- Cache: Redis 7
- Payments: Stripe (Checkout + Billing + Refunds)
- Email: Resend
- WebSocket: NestJS Gateway (Socket.io)
- Auth: JWT + bcrypt
- Infra: Docker Compose, Nginx

## Structure du Projet
seliv/
├── docker-compose.yml
├── backend/          ← NestJS app
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── missions/
│       ├── subscriptions/
│       ├── payments/
│       ├── options/
│       ├── availabilities/
│       ├── reviews/
│       ├── chat/
│       ├── notifications/
│       └── admin/
├── frontend/         ← Next.js app
│   └── src/
│       └── app/
│           ├── (auth)/
│           ├── (client)/
│           ├── (vendeur)/
│           ├── (moderateur)/
│           └── (admin)/
└── nginx/

## Conventions
- Tous les fichiers en TypeScript strict
- Noms de fichiers : kebab-case
- Noms de classes/types : PascalCase
- API REST avec préfixe /api/v1/
- DTOs avec class-validator
- Entities TypeORM avec UUID
- Tous les prix en centimes (integer) dans la DB, convertis en euros côté frontend
- Dates en UTC dans la DB
- Réponses API : { data, meta?, error? }
- Tests : *.spec.ts pour unitaires, *.e2e-spec.ts pour E2E

## Rôles utilisateur
- client, vendeur, moderateur, admin
- Guards NestJS avec @Roles() decorator

## Statuts de mission
draft → pending_payment → paid → assigned → in_progress → completed | cancelled

## Règles critiques
- JAMAIS exposer téléphone/email du client au vendeur
- Paiement complet à la commande (pas d'acompte)
- Annulation : ≥48h = remboursement 100%, <48h = 50%, in_progress = impossible
- Prix en centimes dans la DB
- Vendeur Star = accessible seulement aux abonnés Pro