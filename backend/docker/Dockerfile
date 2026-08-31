# SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
# SPDX-License-Identifier: AGPL-3.0-only
#
# This Dockerfile uses features which are only available in BuildKit - see
# https://docs.docker.com/go/buildkit/ for more information.
#
# To build the image, run `docker build` command from the root of the
# repository:
#
#    DOCKER_BUILDKIT=1 docker build -f docker/Dockerfile .

## Stage 0: Base image with only pnpm and package.json
FROM docker.io/node:24.20.0-alpine@sha256:e67514e5d0f6c46656005e1b693b2ec9d52e80b641307de684d4a015ba7a4eaf AS base
# Add tini to handle signals
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
RUN apk add --no-cache tini
ENTRYPOINT ["tini", "--"]

# Corepack picks the pnpm version from the packageManager field in package.json
RUN corepack enable pnpm

ENV PNPM_STORE_DIR=/tmp/.pnpm-store

## Stage 1: Code with all dependencies
FROM base AS code-with-deps
RUN apk add --no-cache libc6-compat git

USER node
WORKDIR /usr/src/app

COPY --chown=node . .

# Install dependencies first to not invalidate the cache on every source change
RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/tmp/.pnpm-store \
    pnpm install --frozen-lockfile --store-dir "$PNPM_STORE_DIR"

## Stage 2a: Compile TypeScript
FROM code-with-deps AS builder
USER node
WORKDIR /usr/src/app

# Build without using caches to ensure a fresh build
RUN pnpm run build --filter=@hedgedoc/backend --cache=local:,remote: --no-daemon

## Stage 2b: Install only prod dependencies
FROM code-with-deps AS prod-dependencies
USER node
WORKDIR /usr/src/app

# Narrowing the existing node_modules down to production dependencies makes
# pnpm purge it first, which it will not do unattended without this.
ENV CI=true

# Prune to just the production dependencies of the backend and the workspace
# packages it depends on. nodeLinker: hoisted keeps these in the root
# node_modules, which stage 3 copies wholesale.
RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/tmp/.pnpm-store \
    pnpm install --frozen-lockfile --prod --filter "@hedgedoc/backend..." --store-dir "$PNPM_STORE_DIR"

## Stage 3: Final image, only production dependencies
FROM base AS prod

LABEL org.opencontainers.image.title='HedgeDoc production backend image'
LABEL org.opencontainers.image.url='https://hedgedoc.org'
LABEL org.opencontainers.image.source='https://github.com/hedgedoc/hedgedoc'
LABEL org.opencontainers.image.documentation='https://github.com/hedgedoc/hedgedoc/blob/develop/docs/content/how-to/develop/docker.md'
LABEL org.opencontainers.image.licenses='AGPL-3.0'

USER node
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY --chown=node package.json package.json
# Most dependencies hoist to the root node_modules, but not all of them: the
# per-package directories below hold the @hedgedoc/* workspace links and any
# dependency whose version conflicted with the hoisted one.
COPY --chown=node --from=prod-dependencies /usr/src/app/node_modules ./node_modules

COPY --chown=node backend/package.json backend/package.json
COPY --chown=node --from=prod-dependencies /usr/src/app/backend/node_modules backend/node_modules
COPY --chown=node --from=builder /usr/src/app/backend/dist/src backend/dist
COPY --chown=node --from=builder /usr/src/app/backend/dist/package.json backend/dist/package.json
COPY --chown=node backend/public backend/public

COPY --chown=node database/package.json /usr/src/app/database/package.json
COPY --chown=node --from=builder /usr/src/app/database/dist database/dist

COPY --chown=node commons/package.json /usr/src/app/commons/package.json
COPY --chown=node --from=prod-dependencies /usr/src/app/commons/node_modules commons/node_modules
COPY --chown=node --from=builder /usr/src/app/commons/dist commons/dist

WORKDIR /usr/src/app/backend
EXPOSE 3000/tcp
CMD  ["node", "dist/main.js"]
