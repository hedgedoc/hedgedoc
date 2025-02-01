# SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: CC-BY-SA-4.0

# BASE
FROM docker.io/node:20.18.2-alpine@sha256:2cd2a6f4cb37cf8a007d5f1e9aef090ade6b62974c7a274098c390599e8c72b4 AS base
RUN apk add --no-cache tini
ENTRYPOINT ["tini", "--"]

# BUILD
FROM base AS builder

RUN apk add --no-cache libc6-compat git
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ENV YARN_CACHE_FOLDER=/tmp/.yarn
USER node
WORKDIR /usr/src/app

COPY --chown=node . .
RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/tmp/.yarn \
    yarn install --immutable

ARG TURBO_TEAM
ARG TURBO_API
ARG TURBO_TOKEN

RUN yarn build --filter=@hedgedoc/frontend --no-cache --no-daemon

# RUNNER
FROM base
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

LABEL org.opencontainers.image.title='HedgeDoc production frontend image'
LABEL org.opencontainers.image.url='https://hedgedoc.org'
LABEL org.opencontainers.image.source='https://github.com/hedgedoc/hedgedoc'
LABEL org.opencontainers.image.documentation='https://github.com/hedgedoc/hedgedoc/blob/develop/docs/content/how-to/develop/docker.md'
LABEL org.opencontainers.image.licenses='AGPL-3.0'

WORKDIR /usr/src/app

COPY --from=builder --chown=node:node /usr/src/app/frontend/dist ./

USER node

ENV PORT 3001
EXPOSE 3001/tcp

WORKDIR /usr/src/app/frontend
CMD ["node", "server.js"]
