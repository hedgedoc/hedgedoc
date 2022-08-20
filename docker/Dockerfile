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
FROM docker.io/node:18-alpine@sha256:0738685cff8a6bbace6a8f308986729e9b31b07083de252d3b2a321473f99089 as base
# Add tini to handle signals
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
RUN apk add --no-cache tini
ENTRYPOINT ["tini"]

USER node
WORKDIR /usr/src/app

COPY --chown=node .yarn .yarn
COPY --chown=node package.json yarn.lock .yarnrc.yml ./


## Stage 1: Code with all dependencies
FROM base as code-with-deps
USER node
WORKDIR /usr/src/app

# Install dependencies first to not invalidate the cache on every source change
RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/tmp/.yarn \
    YARN_CACHE_FOLDER=/tmp/.yarn yarn install --immutable

COPY --chown=node nest-cli.json tsconfig.json tsconfig.build.json ./
COPY --chown=node src src


## Stage 2a: Dev config files and tests
FROM code-with-deps as development
USER node
WORKDIR /usr/src/app

COPY --chown=node .eslintrc.js eslint-local-rules.js .prettierrc jest-e2e.json  ./
COPY --chown=node test test

CMD ["node", "-r", "ts-node/register", "src/main.ts"]

## Stage 2b: Compile TypeScript
FROM code-with-deps as builder
USER node
WORKDIR /usr/src/app

RUN yarn run build


## Stage 3: Final image, only production dependencies
FROM base as prod

LABEL org.opencontainers.image.title='HedgeDoc production image'
LABEL org.opencontainers.image.url='https://hedgedoc.org'
LABEL org.opencontainers.image.source='https://github.com/hedgedoc/hedgedoc'
LABEL org.opencontainers.image.documentation='https://github.com/hedgedoc/hedgedoc/blob/develop/docker/README.md'
LABEL org.opencontainers.image.licenses='AGPL-3.0'

USER node
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY --chown=node --from=builder /usr/src/app/dist ./dist

RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/tmp/.yarn \
    YARN_CACHE_FOLDER=/tmp/.yarn yarn workspaces focus --all --production

CMD  ["node", "dist/main.js"]
