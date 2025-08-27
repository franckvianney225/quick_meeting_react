# Étape de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm ci

# Installer le CLI NestJS globalement
RUN npm install -g @nestjs/cli


# Copier le code source
COPY src/ ./src/
COPY nest-cli.json ./

# Build l'application
RUN npx nest build

# Étape de production
FROM node:20-alpine AS production

WORKDIR /app

# Installer les dépendances de production seulement
COPY package*.json ./
RUN npm ci --only=production

# Installer toutes les dépendances (y compris dev)
RUN npm install

# Copier les fichiers buildés depuis l'étape builder
COPY --from=builder /app/dist ./dist

# Créer le dossier uploads pour les fichiers statiques
RUN mkdir -p uploads/avatars

# Exposer le port
EXPOSE 3001

# Commande de démarrage
CMD ["npm", "run", "start:prod"]