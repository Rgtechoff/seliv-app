#!/bin/bash
# ============================================================
# Lance le seed sur la DB de PRODUCTION (dans Docker)
# Usage : ./scripts/seed-prod.sh
#
# À n'exécuter qu'UNE SEULE FOIS après le premier déploiement.
# ============================================================

set -e

echo "=============================="
echo " SELIV — Seed PRODUCTION"
echo "=============================="
echo ""
echo "⚠️  ATTENTION : Cette opération EFFACE TOUTES LES DONNÉES"
echo "   et réinsère les données initiales dans la DB de production."
echo ""
read -p "Êtes-vous certain ? Tapez 'CONFIRMER' pour continuer : " CONFIRM

if [ "$CONFIRM" != "CONFIRMER" ]; then
  echo "Annulé."
  exit 0
fi

# Vérifier que le container backend tourne
if ! docker ps --format '{{.Names}}' | grep -q "seliv_backend"; then
  echo "❌ Le container seliv_backend n'est pas démarré."
  exit 1
fi

echo ""
echo "🌱 Lancement du seed en production..."
docker exec seliv_backend node dist/seed

echo ""
echo "✅ Seed terminé."
echo ""
echo "⚠️  Pensez à changer le mot de passe admin immédiatement !"
echo "   admin@seliv.fr / Admin1234!"
