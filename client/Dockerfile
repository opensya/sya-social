# Étape 1 : Build de l'application
FROM oven/bun:1 AS builder

# Installer Python et les outils de build nécessaires
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les fichiers nécessaires
COPY . .

# Installer les dépendances
RUN bun install

# Construire l'application Nuxt
RUN bun run build

# Étape 2 : Image finale allégée pour la production
FROM oven/bun:1-slim AS runner

# Installer Python et les outils de build nécessaires
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les fichiers nécessaires à l'exécution
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/package.json ./package.json

# Installer uniquement les dépendances de production
RUN bun install --production

# Démarrer Nuxt
CMD ["bun", "./.output/server/index.mjs"]
