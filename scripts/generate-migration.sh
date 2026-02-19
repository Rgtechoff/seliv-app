#!/bin/bash
# ============================================================
# Génère la migration initiale TypeORM depuis les entités
#
# Fonctionnement :
#  1. Crée une DB temporaire vide dans le container postgres
#  2. Lance migration:generate contre cette DB vide
#     → TypeORM compare entités vs DB vide = génère tous les CREATE TABLE
#  3. Supprime la DB temporaire
#
# Usage : ./scripts/generate-migration.sh [NomMigration]
# Exemple : ./scripts/generate-migration.sh InitialSchema
# ============================================================

set -e

MIGRATION_NAME="${1:-InitialSchema}"
TEMP_DB="seliv_migration_temp"
PG_USER="seliv"
PG_PASSWORD="seliv_password"
PG_HOST="localhost"
PG_PORT="5432"
TEMP_URL="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${TEMP_DB}"

echo "=============================="
echo " Génération migration : $MIGRATION_NAME"
echo "=============================="

# Vérifier que postgres tourne
if ! docker exec seliv_postgres pg_isready -U "$PG_USER" -q 2>/dev/null; then
  echo "❌ Le container seliv_postgres n'est pas accessible."
  echo "   Démarrer Docker : docker compose up -d postgres"
  exit 1
fi

# 1. Créer la DB temporaire vide
echo ""
echo "📦 Création de la DB temporaire '$TEMP_DB'..."
docker exec seliv_postgres psql -U "$PG_USER" -c "DROP DATABASE IF EXISTS $TEMP_DB;" 2>/dev/null
docker exec seliv_postgres psql -U "$PG_USER" -c "CREATE DATABASE $TEMP_DB;"

echo "✅ DB temporaire créée."

# 2. Générer la migration contre la DB vide
echo ""
echo "🔨 Génération de la migration '$MIGRATION_NAME'..."
cd "$(dirname "$0")/../backend"

DATABASE_URL="$TEMP_URL" \
  npm run migration:generate -- "src/migrations/$MIGRATION_NAME"

MIGRATION_STATUS=$?

# 3. Supprimer la DB temporaire
echo ""
echo "🧹 Suppression de la DB temporaire..."
docker exec seliv_postgres psql -U "$PG_USER" -c "DROP DATABASE IF EXISTS $TEMP_DB;" 2>/dev/null

if [ $MIGRATION_STATUS -eq 0 ]; then
  echo ""
  echo "✅ Migration générée dans backend/src/migrations/"
  ls -la src/migrations/*.ts 2>/dev/null | tail -5
  echo ""
  echo "Prochaines étapes :"
  echo "  1. Vérifier le fichier généré dans src/migrations/"
  echo "  2. Committer : git add src/migrations/ && git commit -m 'add: migration $MIGRATION_NAME'"
else
  echo "❌ Erreur lors de la génération de la migration."
  exit 1
fi
