FROM oven/bun:1-slim AS runner

WORKDIR /app

# Copier les fichiers nécessaires à l'exécution
COPY ./dist ./dist
COPY ./bun.lock ./bun.lock
COPY ./package.json ./package.json

# Installer uniquement les dépendances de production
RUN bun install --production

# Start the server using the production build
CMD [ "bun", "run", "start:prod" ]
