#!/bin/bash
set -e

echo "Déploiement de SkillHub..."

if [ ! -f .env ]; then
  echo "Erreur : le fichier .env est absent. Copiez .env.dist en .env et renseignez les valeurs."
  exit 1
fi

echo "Récupération des dernières images..."
docker compose pull

echo "Redémarrage des services..."
docker compose up -d

echo "Nettoyage des images obsolètes..."
docker image prune -f

echo "Déploiement terminé."
docker compose ps