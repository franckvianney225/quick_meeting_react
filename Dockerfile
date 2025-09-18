# Étape de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY next.config.js ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY src/ ./src/
COPY public/ ./public/

# Définir les variables d'environnement pour le build
ENV NEXT_PUBLIC_API_URL=http://164.160.40.182:3001

# Build l'application
RUN npm run build -- --no-lint

# Étape de production
FROM node:20-alpine AS production

WORKDIR /app

# Installer les dépendances de production seulement
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copier les fichiers buildés depuis l'étape builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Exposer le port
EXPOSE 3000

# Variables d'environnement pour la production
ENV NODE_ENV=production

# Commande de démarrage
CMD ["npm", "start"]