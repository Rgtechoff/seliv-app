#!/bin/sh
# Script de démarrage production
# 1. Exécute les migrations en attente
# 2. Lance l'application NestJS

set -e

echo "=============================="
echo " SELIV Backend — Démarrage"
echo "=============================="

echo ""
echo "⏳ Étape 1/2 : Migrations..."
node dist/migration-runner

echo ""
echo "⏳ Étape 2/2 : Démarrage de l'application..."
exec dumb-init node dist/main
