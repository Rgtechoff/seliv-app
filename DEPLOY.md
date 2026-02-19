# SELIV — Guide de déploiement VPS (Docker)

## Architecture de production

```
Internet
   │
   ▼
[Nginx :80/:443]  ←── SSL Let's Encrypt (Certbot)
   ├── /api/*  → [Backend NestJS :4000]
   ├── /socket.io/*  → [Backend NestJS :4000]
   └── /*  → [Frontend Next.js :3000]
              │
    [PostgreSQL :5432] + [Redis :6379]
```

Tout tourne dans Docker. Nginx expose uniquement les ports 80 et 443.

---

## Prérequis VPS

- Ubuntu 22.04 LTS (recommandé) — 2 vCPU / 4 Go RAM minimum
- Nom de domaine pointant vers l'IP du VPS (A record)
- Ports 80 et 443 ouverts dans le firewall

---

## 1. Préparation du VPS

```bash
# Connexion SSH
ssh root@<IP_VPS>

# Mise à jour système
apt update && apt upgrade -y

# Installation Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Installation Docker Compose v2
apt install -y docker-compose-plugin

# Vérification
docker --version
docker compose version

# Créer un utilisateur non-root (optionnel mais recommandé)
adduser seliv
usermod -aG docker seliv
```

---

## 2. Déploiement du code

```bash
# Sur le VPS, créer le dossier app
mkdir -p /opt/seliv
cd /opt/seliv

# Option A : via Git (recommandé)
git clone https://github.com/<vous>/seliv.git .

# Option B : via rsync depuis votre machine locale
# rsync -avz --exclude node_modules --exclude .git \
#   /Users/macbookpro/Downloads/app/seliv/ root@<IP_VPS>:/opt/seliv/
```

---

## 3. Configuration des variables d'environnement

```bash
cd /opt/seliv
cp .env.prod.example .env.prod
nano .env.prod
```

Remplir **toutes** les valeurs (voir `.env.prod.example`).

---

## 4. Configuration Nginx + SSL

```bash
# Éditer la config nginx avec votre domaine
nano nginx/nginx.prod.conf
# Remplacer VOTRE_DOMAINE par ex: seliv.fr

# Créer les dossiers pour Let's Encrypt
mkdir -p certbot/www certbot/conf
```

**Étape SSL en 2 temps :**

**4a. Premier démarrage HTTP uniquement** (pour valider le domaine)

```bash
# Utiliser la config HTTP temporaire (sans SSL)
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d nginx

# Obtenir le certificat Let's Encrypt
docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm certbot \
  certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@VOTRE_DOMAINE \
  --agree-tos \
  --no-eff-email \
  -d VOTRE_DOMAINE \
  -d www.VOTRE_DOMAINE
```

**4b. Démarrage complet avec HTTPS**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

---

## 5. Vérification

```bash
# Voir les containers
docker compose -f docker-compose.prod.yml ps

# Logs en direct
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Tester l'API
curl https://VOTRE_DOMAINE/api/v1/health

# Tester le frontend
curl -I https://VOTRE_DOMAINE
```

---

## 6. Script de déploiement automatisé

Pour les mises à jour suivantes, utiliser le script `deploy.sh` :

```bash
chmod +x deploy.sh
./deploy.sh
```

Ce script :
1. Pull le nouveau code (`git pull`)
2. Rebuild les images modifiées
3. Redémarre les containers concernés sans downtime
4. Affiche les logs de santé

---

## 7. Renouvellement SSL automatique

Ajouter un cron sur le VPS :

```bash
crontab -e

# Ajouter cette ligne (renouvellement tous les lundis à 3h du matin)
0 3 * * 1 cd /opt/seliv && docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm certbot renew && docker compose -f docker-compose.prod.yml --env-file .env.prod exec nginx nginx -s reload
```

---

## 8. Backup base de données

```bash
# Backup manuel
docker exec seliv_postgres pg_dump -U seliv seliv_db > backup_$(date +%Y%m%d).sql

# Restaurer
cat backup_YYYYMMDD.sql | docker exec -i seliv_postgres psql -U seliv seliv_db
```

---

---

## 9. Migrations et Seed de la base de données

### Méthode recommandée — Script automatique (premier déploiement)

Le script `scripts/first-deploy.sh` fait **tout en une commande** :

```bash
chmod +x scripts/first-deploy.sh
./scripts/first-deploy.sh
```

Il gère dans l'ordre :
1. Build des images Docker
2. Démarrage avec `DB_SYNC=true` → TypeORM crée toutes les tables automatiquement
3. Seed : insertion des données initiales (comptes admin, vendeurs, etc.)
4. Redémarrage en mode production normal (`DB_SYNC=false`)

---

### Méthode manuelle (si vous préférez contrôler chaque étape)

**Étape 1 — Créer le schéma (première fois uniquement)**

Ajouter temporairement dans `.env.prod` :
```
DB_SYNC=true
```

Démarrer les containers :
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

TypeORM crée automatiquement toutes les tables. Vérifier avec :
```bash
docker compose -f docker-compose.prod.yml logs backend | grep -E "query|synchronize|error"
```

**Étape 2 — Retirer DB_SYNC et redémarrer**

Retirer `DB_SYNC=true` de `.env.prod`, puis :
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod restart backend
```

**Étape 3 — Seed (données initiales)**

```bash
docker exec seliv_backend node dist/seed
# OU
./scripts/seed-prod.sh
```

---

### Pour les modifications d'entités (après le premier déploiement)

Quand vous modifiez une entité TypeORM, générez une migration **depuis votre machine locale** :

```bash
cd backend

# La DB postgres doit être accessible (docker compose up postgres)
npm run migration:generate -- src/migrations/NomDuChangement

# Vérifier le fichier généré, puis committer
git add src/migrations/
git commit -m "add: migration NomDuChangement"
```

Au prochain `./deploy.sh`, la migration est appliquée automatiquement au démarrage du container (via `start.prod.sh` → `node dist/migration-runner`).

Autres commandes utiles :
```bash
npm run migration:show     # voir les migrations en attente
npm run migration:revert   # annuler la dernière migration
```

---

### Seed — Données initiales (première mise en production)

Le seed crée les comptes de base (admin, moderateur) et les données de test.

> ⚠️ **À n'exécuter qu'une seule fois** après le premier déploiement.
> Le seed **efface toutes les données** existantes via TRUNCATE avant de réinsérer.

```bash
# Sur le VPS, après que le container backend est démarré
docker exec seliv_backend node dist/seed
```

**Comptes créés par le seed :**

| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@seliv.fr` | `Admin1234!` | ADMIN |
| `modo@seliv.fr` | `Modo1234!` | MODERATEUR |
| `client1@seliv.fr` | `Client1234!` | CLIENT |
| `client2@seliv.fr` | `Client1234!` | CLIENT |
| `vendeur1@seliv.fr` | `Vendeur1234!` | VENDEUR (Pro ⭐) |
| `vendeur2@seliv.fr` | `Vendeur1234!` | VENDEUR (Basic) |

> En production réelle, **changer les mots de passe admin** immédiatement après.

---

### Checklist premier déploiement

```
[ ] 1. Générer la migration InitialSchema en local
[ ] 2. Committer la migration dans Git
[ ] 3. Pusher sur le VPS (git pull)
[ ] 4. Lancer docker compose up --build
[ ] 5. Vérifier les logs : migrations appliquées
[ ] 6. Exécuter le seed UNE SEULE FOIS : docker exec seliv_backend node dist/seed
[ ] 7. Tester la connexion admin sur https://VOTRE_DOMAINE
[ ] 8. Changer le mot de passe admin
```

---

## Variables d'environnement importantes

| Variable | Description | Exemple |
|---|---|---|
| `DOMAIN` | Domaine principal | `seliv.fr` |
| `JWT_SECRET` | Secret JWT (min 32 chars) | `openssl rand -hex 32` |
| `POSTGRES_PASSWORD` | Mot de passe DB | string aléatoire |
| `RESEND_API_KEY` | Clé API Resend (emails) | `re_xxxx` |
| `STRIPE_SECRET_KEY` | Clé Stripe | `sk_live_xxxx` |
| `NEXT_PUBLIC_API_URL` | URL publique API | `https://seliv.fr/api/v1` |

---

## Commandes utiles

```bash
# Redémarrer un service
docker compose -f docker-compose.prod.yml --env-file .env.prod restart backend

# Voir les logs d'un service
docker compose -f docker-compose.prod.yml logs --tail=100 -f backend

# Entrer dans un container
docker exec -it seliv_backend sh

# Exécuter le seed (première fois seulement)
docker exec seliv_backend npm run seed

# Stopper tout
docker compose -f docker-compose.prod.yml --env-file .env.prod down

# Stopper et supprimer les volumes (DANGER: perd les données)
docker compose -f docker-compose.prod.yml --env-file .env.prod down -v
```
