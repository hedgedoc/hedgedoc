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

## Stage 0: Base image with only yarn and package.json
FROM docker.io/node:20.19.5-alpine@sha256:6178e78b972f79c335df281f4b7674a2d85071aae2af020ffa39f0a770265435 AS base
# Add tini to handle signals
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
RUN apk add --no-cache tini
ENTRYPOINT ["tini", "--"]

ENV YARN_CACHE_FOLDER /tmp/.yarn

## Stage 1: Code with all dependencies
FROM base AS code-with-deps
RUN apk add --no-cache libc6-compat git

USER node
WORKDIR /usr/src/app

COPY --chown=node . .

# Install dependencies first to not invalidate the cache on every source change
RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/tmp/.yarn \
    yarn install --immutable && yarn workspaces focus hedgedoc @hedgedoc/backend @hedgedoc/database @hedgedoc/commons

## Stage 2a: Compile TypeScript
FROM code-with-deps AS builder
USER node
WORKDIR /usr/src/app

RUN yarn build --filter=@hedgedoc/backend --no-cache --no-daemon

## Stage 2b: Install only prod dependencies
FROM code-with-deps AS prod-dependencies
USER node
WORKDIR /usr/src/app

RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/tmp/.yarn \
    yarn workspaces focus --production @hedgedoc/backend

## Stage 3: Final image, only production dependencies
FROM base AS prod

LABEL org.opencontainers.image.title='HedgeDoc production backend image'
LABEL org.opencontainers.image.url='https://hedgedoc.org'
LABEL org.opencontainers.image.source='https://github.com/hedgedoc/hedgedoc'
LABEL org.opencontainers.image.documentation='https://github.com/hedgedoc/hedgedoc/blob/develop/docs/content/how-to/develop/docker.md'
LABEL org.opencontainers.image.licenses='AGPL-3.0'

USER node
WORKDIR /usr/src/app
ENV NODE_ENV production

COPY --chown=node package.json package.json
COPY --chown=node --from=prod-dependencies /usr/src/app/node_modules ./node_modules

COPY --chown=node backend/package.json backend/package.json
COPY --chown=node --from=builder /usr/src/app/backend/dist/src backend/dist
COPY --chown=node backend/public backend/public

COPY --chown=node database/package.json /usr/src/app/database/package.json
COPY --chown=node --from=builder /usr/src/app/database/dist database/dist

COPY --chown=node commons/package.json /usr/src/app/commons/package.json
COPY --chown=node --from=builder /usr/src/app/commons/dist commons/dist

WORKDIR /usr/src/app/backend
CMD  ["node", "dist/main.js"]
