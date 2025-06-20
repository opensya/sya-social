# FROM oven/bun:1-slim AS runner

# WORKDIR /app

# # Copier les fichiers nécessaires à l'exécution
# COPY ./bun.lock ./bun.lock
# COPY ./package.json ./package.json

# # Installer uniquement les dépendances de production
# RUN bun install --frozen-lockfile
# RUN bun run build

# # Start the server using the production build
# CMD [ "bun", "run", "start:prod" ]

FROM oven/bun:alpine AS base

RUN apk add --no-cache bash
RUN bun install -g @nestjs/cli typescript ts-node

WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/dist ./dist
COPY --from=prerelease /usr/src/app/package.json .

# Créer le dossier secrets et en donner l'accès à l'utilisateur bun
RUN mkdir -p /usr/src/app/secrets && chown -R bun:bun /usr/src/app/secrets

# run the app
USER bun
ENTRYPOINT [ "bun", "run", "start:prod" ]
