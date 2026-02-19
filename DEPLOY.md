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
