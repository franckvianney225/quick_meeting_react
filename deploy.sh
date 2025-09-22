#!/bin/bash

# Script de déploiement Docker pour E-Présence React
set -e

echo "🚀 Déploiement de E-Présence React avec Docker"

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

# Vérifier que Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

# Fonction pour afficher l'usage
usage() {
    echo "Usage: $0 [command]"
    echo "Commands:"
    echo "  up       - Démarre les services (détaché)"
    echo "  down     - Arrête et supprime les services"
    echo "  restart  - Redémarre les services"
    echo "  logs     - Affiche les logs"
    echo "  build    - Reconstruit les images"
    echo "  status   - Affiche le statut des services"
}

# Fonction pour démarrer les services
start_services() {
    echo "📦 Construction des images Docker..."
    docker-compose build
    
    echo "🚀 Démarrage des services..."
    docker-compose up -d
    
    echo "✅ Services démarrés avec succès!"
    echo ""
    echo "📊 Statut des services:"
    docker-compose ps
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:3001"
    echo "🐘 PostgreSQL: localhost:5432"
    echo ""
    echo "📋 Pour voir les logs: ./deploy.sh logs"
}

# Fonction pour arrêter les services
stop_services() {
    echo "🛑 Arrêt des services..."
    docker-compose down
    echo "✅ Services arrêtés."
}

# Fonction pour redémarrer
restart_services() {
    stop_services
    start_services
}

# Fonction pour afficher les logs
show_logs() {
    echo "📋 Logs des services (Ctrl+C pour quitter):"
    docker-compose logs -f
}

# Fonction pour reconstruire
rebuild_services() {
    echo "🔨 Reconstruction des images..."
    docker-compose build
    echo "✅ Images reconstruites."
}

# Fonction pour afficher le statut
show_status() {
    echo "📊 Statut des services:"
    docker-compose ps
}

# Gestion des commandes
case "${1:-}" in
    up)
        start_services
        ;;
    down)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    build)
        rebuild_services
        ;;
    status)
        show_status
        ;;
    *)
        usage
        exit 1
        ;;
esac