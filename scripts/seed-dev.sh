#!/bin/bash
# ============================================================
# Lance le seed sur la DB de développement locale
# Usage : ./scripts/seed-dev.sh
# ============================================================

set -e

echo "=============================="
echo " SELIV — Seed DEV"
echo "=============================="
echo "⚠️  Cette opération efface et réinsère toutes les données."
read -p "Continuer ? (oui/non) : " CONFIRM

if [ "$CONFIRM" != "oui" ]; then
  echo "Annulé."
  exit 0
fi

cd "$(dirname "$0")/../backend"

echo ""
echo "🌱 Lancement du seed..."
npm run seed

echo ""
echo "✅ Seed terminé. Comptes disponibles :"
echo ""
echo "  admin@seliv.fr      / Admin1234!   (ADMIN)"
echo "  modo@seliv.fr       / Modo1234!    (MODERATEUR)"
echo "  client1@seliv.fr    / Client1234!  (CLIENT)"
echo "  client2@seliv.fr    / Client1234!  (CLIENT)"
echo "  vendeur1@seliv.fr   / Vendeur1234! (VENDEUR Pro ⭐)"
echo "  vendeur2@seliv.fr   / Vendeur1234! (VENDEUR Basic)"
