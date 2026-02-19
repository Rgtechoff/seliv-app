#!/bin/bash
# ============================================================
# SELIV — Script de déploiement
# Usage: ./deploy.sh [--full] [--backend-only] [--frontend-only]
#   --full           Rebuild tout depuis zéro
#   --backend-only   Rebuild uniquement le backend
#   --frontend-only  Rebuild uniquement le frontend
#   (sans argument)  Pull + rebuild les services modifiés
# ============================================================

set -e  # Arrêter en cas d'erreur

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo "=============================="
echo " SELIV Deploy — $TIMESTAMP"
echo "=============================="

# Vérifier que .env.prod existe
if [ ! -f ".env.prod" ]; then
  echo "❌ Fichier .env.prod introuvable."
  echo "   Copier .env.prod.example → .env.prod et remplir les valeurs."
  exit 1
fi

# Pull latest code
echo ""
echo "📥 Récupération du code..."
git pull origin main

# Choisir quoi rebuilder
case "$1" in
  --full)
    echo ""
    echo "🔨 Rebuild complet (--no-cache)..."
    $COMPOSE build --no-cache
    echo ""
    echo "🚀 Démarrage des containers..."
    $COMPOSE up -d
    ;;
  --backend-only)
    echo ""
    echo "🔨 Rebuild backend uniquement..."
    $COMPOSE build backend
    echo ""
    echo "🔄 Redémarrage backend..."
    $COMPOSE up -d --no-deps backend
    ;;
  --frontend-only)
    echo ""
    echo "🔨 Rebuild frontend uniquement..."
    $COMPOSE build frontend
    echo ""
    echo "🔄 Redémarrage frontend..."
    $COMPOSE up -d --no-deps frontend
    ;;
  *)
    echo ""
    echo "🔨 Rebuild des services modifiés..."
    $COMPOSE build
    echo ""
    echo "🚀 Démarrage/mise à jour des containers..."
    $COMPOSE up -d
    ;;
esac

# Attendre que les services soient healthy
echo ""
echo "⏳ Vérification de la santé des services..."
sleep 5

# Vérifier le statut
$COMPOSE ps

# Test rapide de l'API
echo ""
echo "🔍 Test de l'API..."
ENV_FILE=".env.prod"
DOMAIN=$(grep "^DOMAIN=" $ENV_FILE | cut -d'=' -f2)

if curl -sf "https://$DOMAIN/api/v1/health" > /dev/null 2>&1; then
  echo "✅ API accessible sur https://$DOMAIN/api/v1/health"
elif curl -sf "http://localhost:4000/api/v1/health" > /dev/null 2>&1; then
  echo "✅ API accessible sur http://localhost:4000/api/v1/health"
else
  echo "⚠️  L'API ne répond pas encore. Vérifier les logs:"
  echo "    docker compose -f docker-compose.prod.yml logs --tail=50 backend"
fi

# Nettoyage des images orphelines
echo ""
echo "🧹 Nettoyage des images inutilisées..."
docker image prune -f

echo ""
echo "✅ Déploiement terminé — $TIMESTAMP"
echo ""
echo "Commandes utiles:"
echo "  Logs backend  : $COMPOSE logs -f backend"
echo "  Logs frontend : $COMPOSE logs -f frontend"
echo "  Statut        : $COMPOSE ps"
