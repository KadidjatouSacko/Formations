# scripts/start-dev.sh - Script de démarrage en développement
#!/bin/bash

echo "🚀 Démarrage de FormaPro+ en mode développement"

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que PostgreSQL est démarré
if ! pg_isready &> /dev/null; then
    echo "⚠️ PostgreSQL ne semble pas être démarré. Assurez-vous qu'il est actif."
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Copier le fichier d'environnement si il n'existe pas
if [ ! -f ".env" ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    echo "⚠️ N'oubliez pas de configurer vos variables d'environnement dans .env"
fi

# Configurer la base de données si nécessaire
echo "🔧 Vérification de la base de données..."
npm run db:setup 2>/dev/null || echo "La base de données semble déjà configurée"

# Démarrer le serveur
echo "🎯 Démarrage du serveur..."
npm run dev

# README.md - Documentation du projet
# FormaPro+ 🎓