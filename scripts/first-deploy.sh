#!/bin/bash
# ============================================================
# SELIV — Script de PREMIER déploiement
#
# Ce script gère la toute première mise en production :
#  1. Démarre les containers avec DB_SYNC=true
#     → TypeORM crée toutes les tables automatiquement
#  2. Attend que le backend soit prêt
#  3. Lance le seed (données initiales)
#  4. Redémarre le backend sans DB_SYNC (mode production normal)
#
# Usage : ./scripts/first-deploy.sh
# Prérequis : .env.prod rempli, code sur le VPS
# ============================================================

set -e
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"

echo "============================================"
echo " SELIV — Premier déploiement"
echo "============================================"
echo ""
echo "Ce script va :"
echo "  1. Construire et démarrer tous les containers"
echo "  2. Créer le schéma de la base de données"
echo "  3. Insérer les données initiales (seed)"
echo ""
read -p "Continuer ? (oui/non) : " CONFIRM
[ "$CONFIRM" = "oui" ] || { echo "Annulé."; exit 0; }

# ─── Étape 1 : Build et démarrage avec DB_SYNC=true ────────────────────────
echo ""
echo "⏳ [1/4] Build des images Docker..."
$COMPOSE build

echo ""
echo "⏳ [2/4] Démarrage avec DB_SYNC=true (création du schéma)..."
DB_SYNC=true $COMPOSE up -d

echo ""
echo "⏳ Attente que le backend soit prêt (max 60 secondes)..."
MAX_WAIT=60
ELAPSED=0
until docker exec seliv_backend node -e "
  const http = require('http');
  http.get('http://localhost:4000/api/v1/health', r => process.exit(r.statusCode === 200 ? 0 : 1))
    .on('error', () => process.exit(1));
" 2>/dev/null; do
  sleep 3
  ELAPSED=$((ELAPSED + 3))
  echo "   ...attente ($ELAPSED/${MAX_WAIT}s)"
  if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo "⚠️  Le backend tarde à démarrer. Vérifier les logs :"
    echo "   $COMPOSE logs --tail=30 backend"
    echo ""
    echo "Le schéma a peut-être quand même été créé. Vous pouvez continuer manuellement :"
    echo "   docker exec seliv_backend node dist/seed"
    exit 1
  fi
done

echo "✅ Backend prêt !"

# ─── Étape 3 : Seed ────────────────────────────────────────────────────────
echo ""
echo "⏳ [3/4] Insertion des données initiales (seed)..."
docker exec seliv_backend node dist/seed
echo "✅ Seed terminé."

# ─── Étape 4 : Redémarrage sans DB_SYNC ────────────────────────────────────
echo ""
echo "⏳ [4/4] Redémarrage en mode production normal (DB_SYNC=false)..."
$COMPOSE stop backend
$COMPOSE up -d backend
echo "✅ Backend redémarré."

# ─── Résumé ────────────────────────────────────────────────────────────────
echo ""
echo "============================================"
echo " ✅ Premier déploiement terminé !"
echo "============================================"
echo ""
echo "Comptes créés :"
echo "  admin@seliv.fr      / Admin1234!   → CHANGER CE MOT DE PASSE !"
echo "  modo@seliv.fr       / Modo1234!"
echo "  client1@seliv.fr    / Client1234!"
echo "  vendeur1@seliv.fr   / Vendeur1234! (Pro ⭐)"
echo "  vendeur2@seliv.fr   / Vendeur1234! (Basic)"
echo ""
echo "Statut des containers :"
$COMPOSE ps
