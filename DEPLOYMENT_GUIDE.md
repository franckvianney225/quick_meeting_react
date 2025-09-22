# Guide de Déploiement E-Présence - Résumé des Problèmes Rencontrés

## 🚨 Problèmes Courants et Solutions

### 1. **Erreurs de Build Docker**
**Problème**: Build échoue à cause de Node.js version incompatible
**Solution**: Mettre à jour tous les Dockerfiles vers Node.js 20
```dockerfile
FROM node:20-alpine
```

### 2. **Variables d'Environnement Manquantes**
**Problème**: `NEXT_PUBLIC_API_URL` non définie en production
**Solution**: Ajouter dans Dockerfile frontend
```dockerfile
ENV NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. **Erreurs TypeScript - useSearchParams()**
**Problème**: Hook React nécessite des boundaries Suspense
**Solution**: Encapsuler les pages avec Suspense
```tsx
<Suspense fallback={<div>Loading...</div>}>
  <PageComponent />
</Suspense>
```

### 4. **Dépendances Manquantes NestJS**
**Problème**: `AdminGuard` nécessite `AuthService` non importé
**Solution**: Importer `AuthModule` dans `AdminModule`
```typescript
@Module({
  imports: [AuthModule],
  // ...
})
```

### 5. **Migrations TypeORM Échouées**
**Problème**: Fichier `data-source.ts` non trouvé dans le conteneur
**Solution**: Utiliser le chemin compilé `dist/data-source.js`
```bash
docker compose exec backend npx typeorm migration:run -d dist/data-source.js
```

### 6. **Synchronisation du Schéma Échouée**
**Problème**: Entités non trouvées (`src/**/*.entity.ts` vs `dist/**/*.entity.js`)
**Solution**: Modifier le data-source pour environnement production
```typescript
entities: [process.env.NODE_ENV === 'production' 
  ? 'dist/**/*.entity{.ts,.js}' 
  : 'src/**/*.entity{.ts,.js}'
],
```

### 7. **Hash Bcrypt Corrompu**
**Problème**: Hash tronqué ou format incorrect dans la base
**Solution**: Regénérer et mettre à jour manuellement
```bash
# Générer le hash
docker compose exec backend node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(console.log);"

# Mettre à jour la base
UPDATE users SET password = '$2b$10$...' WHERE email = 'admin@ministere.gov';
```

### 8. **Problèmes de Caractères Spéciaux**
**Problème**: Erreur UTF8 avec les caractères `$` dans les hashs
**Solution**: Utiliser des fichiers SQL intermédiaires
```bash
# Créer le fichier SQL
echo "UPDATE users SET password = '\$2b\$10\$...' WHERE email = 'admin@ministere.gov';" > update.sql

# Copier et exécuter
docker compose cp update.sql postgres:/tmp/
docker compose exec postgres psql -U postgres -d meeting_db -f /tmp/update.sql
```

## 🔧 Commandes Essentielles

### Migrations
```bash
# Exécuter les migrations
docker compose exec backend npx typeorm migration:run -d dist/data-source.js

# Synchroniser le schéma
docker compose exec backend npx typeorm schema:sync -d dist/data-source.js
```

### Base de données
```bash
# Vérifier les tables
docker compose exec postgres psql -U postgres -d meeting_db -c "\dt"

# Vérifier les utilisateurs
docker compose exec postgres psql -U postgres -d meeting_db -c "SELECT email, role, status FROM users;"
```

### Administration
```bash
# Redémarrer les services
docker compose restart backend

# Rebuild les images
docker compose build backend
```

## 📋 Checklist de Déploiement

1. [ ] Vérifier que tous les Dockerfiles utilisent Node.js 20
2. [ ] S'assurer que toutes les variables d'environnement sont définies
3. [ ] Exécuter les migrations TypeORM
4. [ ] Synchroniser le schéma de base de données
5. [ ] Vérifier la création de l'administrateur par défaut
6. [ ] Tester la connexion avec les identifiants admin
7. [ ] Vérifier que toutes les tables sont créées
8. [ ] Tester les fonctionnalités admin

## 🎯 Identifiants par Défaut

- **Email**: `admin@ministere.gov`
- **Mot de passe**: `admin123`
- **⚠️ Important**: Changer le mot de passe après la première connexion

## 📞 Support

En cas de problème, vérifier dans cet ordre :
1. Logs Docker: `docker compose logs backend`
2. État des conteneurs: `docker compose ps`
3. Connexion base: `docker compose exec postgres psql -U postgres -d meeting_db -c "\dt"`
4. Hash du mot de passe: vérifier qu'il commence par `$2b$10$`