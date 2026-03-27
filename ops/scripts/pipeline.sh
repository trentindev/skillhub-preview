#!/bin/bash
# Détection du répertoire racine du projet et création du répertoire logs s'il n'existe pas
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/logs"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/pipeline.log"

echo "----------------------------------------" >> $LOG_FILE
echo "Date: $(date)" >> $LOG_FILE
echo "Pipeline déclenché" >> $LOG_FILE

echo "Utilisateur: $(whoami)" >> $LOG_FILE
echo "Répertoire: $(pwd)" >> $LOG_FILE

echo "Vérification Node.js..." >> $LOG_FILE
node -v >> $LOG_FILE 2>&1

echo "Vérification Docker..." >> $LOG_FILE
docker -v >> $LOG_FILE 2>&1

echo "Test HTTP du backend..." >> $LOG_FILE
curl -s http://localhost:3001/health >> $LOG_FILE 2>&1

echo "Pipeline terminé" >> $LOG_FILE