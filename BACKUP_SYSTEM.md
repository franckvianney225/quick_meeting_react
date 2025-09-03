# Système de Sauvegarde QuickMeeting

## 📋 Fonctionnalités

Le système de sauvegarde offre les fonctionnalités suivantes :

- ✅ **Sauvegardes complètes et incrémentielles**
- ✅ **Gestion des sauvegardes via interface web**
- ✅ **Téléchargement des sauvegardes**
- ✅ **Statistiques en temps réel**
- ✅ **Sauvegarde automatique de la base de données**
- ✅ **Sauvegarde des fichiers uploadés**
- ✅ **Sauvegarde de la configuration**

## 🚀 Installation et Configuration

### 1. Prérequis système

Assurez-vous que les outils suivants sont installés :

```bash
# Sur Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y tar gzip

# Sur CentOS/RHEL
sudo yum install -y tar gzip
```

### 2. Configuration automatique

Exécutez le script de configuration :

```bash
cd backend/scripts
./setup-backup.sh
```

### 3. Redémarrage du serveur

Redémarrez le serveur backend pour charger le nouveau module :

```bash
# Si vous utilisez Docker
docker-compose restart backend

# Si vous utilisez npm
npm run dev
```

## 🎯 Utilisation

### Via l'interface web

1. Connectez-vous en tant qu'administrateur
2. Allez dans **Paramètres** → **Sauvegardes**
3. Utilisez les boutons pour :
   - Créer une nouvelle sauvegarde
   - Télécharger une sauvegarde existante
   - Restaurer une sauvegarde
   - Supprimer des sauvegardes

### Via l'API REST

#### Lister les sauvegardes
```bash
GET /backup
Headers: Authorization: Bearer <token>
```

#### Créer une sauvegarde
```bash
POST /backup
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json

Body: { "type": "full", "description": "Ma sauvegarde" }
```

#### Télécharger une sauvegarde
```bash
GET /backup/{id}/download
Headers: Authorization: Bearer <token>
```

#### Supprimer une sauvegarde
```bash
DELETE /backup/{id}
Headers: Authorization: Bearer <token>
```

## 📊 Structure des sauvegardes

Les sauvegardes sont stockées dans le dossier `backups/` à la racine du projet et contiennent :

- **Base de données** : Dump JSON de toutes les tables
- **Fichiers uploadés** : Dossier `uploads/` avec les avatars et documents
- **Configuration** : Fichiers `.env`, `package.json`, etc.

## 🔧 Personnalisation

### Configuration automatique

Modifiez le service [`BackupService`](backend/src/backup/backup.service.ts) pour :

- Changer la fréquence des sauvegardes automatiques
- Ajouter des fichiers à sauvegarder
- Modifier la stratégie de compression

### Stockage externe

Pour stocker les sauvegardes sur un cloud (AWS S3, Google Cloud Storage, etc.) :

1. Modifiez la méthode `createTarArchive` dans [`BackupService`](backend/src/backup/backup.service.ts)
2. Implémentez l'upload vers votre service cloud préféré
3. Mettez à jour les méthodes de téléchargement et suppression

## 🛠️ Développement

### Structure des fichiers

```
backend/src/backup/
├── backup.controller.ts    # Contrôleur API
├── backup.entity.ts        # Entité TypeORM
├── backup.module.ts        # Module NestJS
└── backup.service.ts       # Service métier

src/hooks/
└── useBackup.ts           # Hook React pour l'interface

src/app/settings/components/
└── BackupSection.tsx      # Composant d'interface
```

### Tests

Pour tester le système de sauvegarde :

```bash
# Créer une sauvegarde de test
curl -X POST http://164.160.40.182:3001/backup \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type":"full","description":"Test"}'

# Lister les sauvegardes
curl http://164.160.40.182:3001/backup \
  -H "Authorization: Bearer <token>"
```

## ⚠️ Notes importantes

1. **Espace disque** : Les sauvegardes peuvent prendre beaucoup d'espace
2. **Sécurité** : Les sauvegardes contiennent des données sensibles
3. **Automatisation** : Configurez des sauvegardes régulières
4. **Test de restauration** : Testez régulièrement la restauration des sauvegardes

## 📞 Support

Pour toute question ou problème avec le système de sauvegarde, consultez la documentation ou contactez l'équipe de développement.