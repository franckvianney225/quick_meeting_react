# Étape de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY src/ ./src/
COPY nest-cli.json ./

# Build l'application
RUN npm run build

# Étape de production
FROM node:18-alpine AS production

WORKDIR /app

# Installer les dépendances de production seulement
COPY package*.json ./
RUN npm ci --only=production

# Copier les fichiers buildés depuis l'étape builder
COPY --from=builder /app/dist ./dist

# Créer le dossier uploads pour les fichiers statiques
RUN mkdir -p uploads/avatars

# Exposer le port
EXPOSE 3001

# Commande de démarrage
CMD ["npm", "run", "start:prod"]