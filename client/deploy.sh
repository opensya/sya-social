#!/bin/bash

# Arrêter les conteneurs existants et les réseaux associés
docker compose down

# Construire l'image et démarrer les conteneurs
docker compose up -d --build
