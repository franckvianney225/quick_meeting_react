# Déploiement Docker - Quick Meeting React

Ce guide explique comment déployer l'application Quick Meeting React avec Docker.

## Structure du projet

```
quick_meeting_react/
│
├── backend/                # API NestJS
│   ├── Dockerfile         # Configuration Docker pour le backend
│   ├── src/               # Code source
│   └── package.json       # Dépendances backend
│
├── frontend/              # Application Next.js (dans le dossier racine)
│   ├── Dockerfile         # Configuration Docker pour le frontend
│   ├── src/               # Code source
│   └── package.json       # Dépendances frontend
│
├── docker-compose.yml     # Orchestration des services
├── .dockerignore          # Fichiers à ignorer dans les builds Docker
└── DEPLOYMENT.md          # Ce fichier
```

## Prérequis

- Docker et Docker Compose installés sur le serveur
- Git (pour cloner le projet)

## Déploiement

### 1. Préparation du serveur

```bash
# Se connecter au serveur
ssh votre-serveur

# Créer un dossier pour le projet
mkdir -p /opt/quick-meeting
cd /opt/quick-meeting
```

### 2. Copier les fichiers du projet

Vous avez deux options :

**Option A: Cloner depuis Git**
```bash
git clone <votre-repo> .
```

**Option B: Copier manuellement**
Copiez tous les fichiers du projet sur le serveur dans le dossier `/opt/quick-meeting`

### 3. Configuration des variables d'environnement

Créez ou modifiez les fichiers `.env` :

**Backend (`backend/.env`) :**
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=meeting_db

# JWT
JWT_SECRET=votre-super-secret-jwt-key-production

# App
PORT=3001
NODE_ENV=production
APP_URL=http://votre-domaine.com:3001
FRONTEND_URL=http://votre-domaine.com:3000
```

**Frontend (`.env` à la racine) :**
```env
NEXT_PUBLIC_API_URL=http://votre-domaine.com:3001
```

### 4. Démarrage des services

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### 5. Vérification

Les services seront accessibles aux URLs suivantes :
- **Frontend** : http://votre-domaine.com:3000
- **Backend API** : http://votre-domaine.com:3001
- **Base de données** : 164.160.40.182:5432

### 6. Commandes utiles

```bash
# Voir l'état des conteneurs
docker-compose ps

# Voir les logs d'un service spécifique
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Redémarrer un service
docker-compose restart backend

# Reconstruire les images
docker-compose build
docker-compose up -d

# Nettoyer (supprimer conteneurs, volumes, réseaux)
docker-compose down -v
```

## Configuration de production

### Variables d'environnement importantes

**Pour le backend :**
- `JWT_SECRET` : Changez cette valeur en production
- `APP_URL` : URL publique de votre backend
- `FRONTEND_URL` : URL publique de votre frontend

**Pour le frontend :**
- `NEXT_PUBLIC_API_URL` : URL publique de votre API backend

### Sécurité

1. **Changez les mots de passe par défaut** dans les variables d'environnement
2. **Utilisez un certificat SSL** avec un reverse proxy (Nginx)
3. **Configurez un firewall** pour limiter l'accès aux ports
4. **Sauvegardez régulièrement** la base de données

### Optimisation des performances

```bash
# Augmenter les ressources mémoire (optionnel)
docker-compose up -d --compatibility --memory=2G
```

## Dépannage

### Problèmes courants

1. **Erreur de connexion à la base de données**
   - Vérifiez que PostgreSQL est démarré
   - Vérifiez les variables d'environnement DB_*

2. **Build échoue**
   - Vérifiez l'espace disque disponible
   - Vérifiez la connexion internet pour télécharger les dépendances

3. **Permissions des volumes**
   - Assurez-vous que Docker a les droits d'écrire dans les volumes

### Logs de débogage

```bash
# Logs détaillés
docker-compose logs --tail=100 -f

# Shell dans un conteneur
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres meeting_db
```

## Mise à jour

Pour mettre à jour l'application :

```bash
# Arrêter les services
docker-compose down

# Mettre à jour le code
git pull

# Reconstruire et redémarrer
docker-compose build
docker-compose up -d
```

## Sauvegarde et restauration

### Sauvegarde de la base de données

```bash
docker-compose exec postgres pg_dump -U postgres meeting_db > backup.sql
```

### Restauration

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres meeting_db
```

---

**Note** : Cette configuration est conçue pour un environnement de développement/production simple. Pour des déploiements à grande échelle, envisagez d'utiliser un orchestrateur comme Kubernetes.