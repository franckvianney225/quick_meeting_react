#!/bin/bash

# Script de configuration du système de sauvegarde
echo "Configuration du système de sauvegarde..."

# Créer le dossier de sauvegarde s'il n'existe pas
mkdir -p ../backups

# Vérifier si les outils système sont disponibles
echo "Vérification des outils système..."

# Vérifier tar
if ! command -v tar &> /dev/null; then
    echo "❌ tar n'est pas installé. Installation nécessaire."
    # Pour Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y tar
    # Pour CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y tar
    else
        echo "⚠️  Veuillez installer manuellement tar sur votre système"
    fi
else
    echo "✅ tar est installé"
fi

# Vérifier gzip
if ! command -v gzip &> /dev/null; then
    echo "❌ gzip n'est pas installé. Installation nécessaire."
    # Pour Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        sudo apt-get install -y gzip
    # Pour CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y gzip
    else
        echo "⚠️  Veuillez installer manuellement gzip sur votre système"
    fi
else
    echo "✅ gzip est installé"
fi

# Vérifier les permissions sur le dossier de sauvegarde
echo "Configuration des permissions..."
chmod 755 ../backups

echo "✅ Configuration du système de sauvegarde terminée"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Redémarrer le serveur backend pour charger le nouveau module"
echo "2. Accéder à la section Sauvegardes dans les paramètres administrateur"
echo "3. Créer votre première sauvegarde"