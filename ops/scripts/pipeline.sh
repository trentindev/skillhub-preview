#!/bin/bash

LOG_FILE="./ops/logs/pipeline.log"

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