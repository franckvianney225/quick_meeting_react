# 🚀 Déploiement Immédiat - Serveur 164.160.40.182

## Prérequis
- Accès SSH au serveur (root@164.160.40.182)
- Docker et Docker Compose installés sur le serveur

## 📋 Étapes de Déploiement

### 1. Connexion au Serveur
```bash
ssh root@164.160.40.182
```

### 2. Préparation du Dossier
```bash
# Créer le dossier du projet
mkdir -p /opt/quick-meeting
cd /opt/quick-meeting
```

### 3. Transfert des Fichiers
**Option A - Via Git (recommandé si vous avez un repo)**
```bash
git clone <votre-repo-git> .
```

**Option B - Via SCP (transfert manuel)**
Depuis votre machine locale :
```bash
scp -r . root@164.160.40.182:/opt/quick-meeting/
```

### 4. Configuration des Variables d'Environnement
```bash
# Copier les templates
cp production.env.example .env
cp production.env.example backend/.env

# Éditer les fichiers avec vos mots de passe sécurisés
nano .env
nano backend/.env
```

**Modifiez ces valeurs dans `.env` et `backend/.env` :**
```env
# Dans .env (frontend)
NEXT_PUBLIC_API_URL=http://164.160.40.182:3001

# Dans backend/.env
DB_PASSWORD=votre-mot-de-passe-postgres-tres-securise
JWT_SECRET=votre-super-secret-jwt-key-tres-long
```

### 5. Construction et Démarrage
```bash
# Construire les images Docker
docker-compose build

# Démarrer tous les services en arrière-plan
docker-compose up -d
```

### 6. Vérification
```bash
# Vérifier que tous les services sont en cours d'exécution
docker-compose ps

# Voir les logs en temps réel
docker-compose logs -f

# Tester l'API
curl http://164.160.40.182:3001/api/health
```

## 🎯 URLs d'Accès
- **Application** : http://164.160.40.182:3000
- **API** : http://164.160.40.182:3001/api/health

## 🔧 Commandes Utiles
```bash
# Arrêter les services
docker-compose down

# Redémarrer un service spécifique
docker-compose restart backend

# Voir les logs d'un service
docker-compose logs backend

# Reconstruire et redémarrer
docker-compose up -d --build
```

## ✅ Validation du Déploiement
1. Ouvrez http://164.160.40.182:3000 dans votre navigateur
2. Testez la connexion à l'API : http://164.160.40.182:3001/api/health
3. Vérifiez que la base de données PostgreSQL est accessible

## 🚨 Résolution de Problèmes
Si vous rencontrez des erreurs :
```bash
# Voir tous les logs
docker-compose logs

# Vérifier les conteneurs
docker ps -a

# Redémarrer tout
docker-compose down && docker-compose up -d
```

**Votre application est maintenant déployée et accessible !** 🎉