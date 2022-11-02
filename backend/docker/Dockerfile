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
FROM docker.io/node:19-alpine@sha256:80844b6643f239c87fceae51e6540eeb054fc7114d979703770ec75250dcd03b as base
# Add tini to handle signals
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
RUN apk add --no-cache tini
ENTRYPOINT ["tini"]

ENV YARN_CACHE_FOLDER /tmp/.yarn
USER node
WORKDIR /usr/src/app

## Stage 1: Code with all dependencies
FROM base as code-with-deps
USER node
WORKDIR /usr/src/app

COPY --chown=node .yarn/plugins .yarn/plugins
COPY --chown=node .yarn/releases .yarn/releases
COPY --chown=node .yarnrc.yml .yarnrc.yml
COPY --chown=node package.json package.json
COPY --chown=node yarn.lock yarn.lock
COPY --chown=node backend/package.json backend/
COPY --chown=node frontend/package.json frontend/

# Install dependencies first to not invalidate the cache on every source change
RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/tmp/.yarn \
    yarn install --immutable && yarn workspaces focus @hedgedoc/backend

COPY --chown=node backend/nest-cli.json backend/tsconfig.json backend/tsconfig.build.json backend/
COPY --chown=node backend/src backend/src

## Stage 2a: Dev config files and tests
FROM code-with-deps as development
USER node
WORKDIR /usr/src/app

COPY --chown=node eslint-local-rules.js eslint-local-rules.js
COPY --chown=node backend/.eslintrc.js backend/.prettierrc.json backend/jest-e2e.json  backend/
COPY --chown=node backend/test backend/test

CMD ["node", "-r", "ts-node/register", "src/main.ts"]

## Stage 2b: Compile TypeScript
FROM code-with-deps as builder
USER node
WORKDIR /usr/src/app/backend

RUN yarn run build

## Stage 3a: Install only prod dependencies
FROM code-with-deps as prod-dependencies
USER node
WORKDIR /usr/src/app

RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/tmp/.yarn \
    yarn workspaces focus --production @hedgedoc/backend

## Stage 3a: Final image, only production dependencies
FROM base as prod

LABEL org.opencontainers.image.title='HedgeDoc production image'
LABEL org.opencontainers.image.url='https://hedgedoc.org'
LABEL org.opencontainers.image.source='https://github.com/hedgedoc/hedgedoc'
LABEL org.opencontainers.image.documentation='https://github.com/hedgedoc/hedgedoc/blob/develop/docs/docker/README.md'
LABEL org.opencontainers.image.licenses='AGPL-3.0'

USER node
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY --chown=node --from=builder /usr/src/app/backend/dist ./
COPY --chown=node backend/package.json package.json
COPY --chown=node --from=prod-dependencies /usr/src/app/node_modules ./node_modules

CMD  ["node", "main.js"]
