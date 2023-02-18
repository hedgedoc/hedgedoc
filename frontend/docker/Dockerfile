# SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: CC-BY-SA-4.0

# BASE
FROM docker.io/node:18-alpine@sha256:045b1a1c90bdfd8fcaad0769922aa16c401e31867d8bf5833365b0874884bbae AS base
RUN apk add --no-cache tini
ENTRYPOINT ["tini", "--"]

# BUILD
FROM base AS builder

RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG BUILD_VERSION=CLIENT_VERSION_MISSING

ENV YARN_CACHE_FOLDER /tmp/.yarn
USER node
WORKDIR /usr/src/app

COPY --chown=node . .
RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/tmp/.yarn \
    yarn install --immutable

ARG TURBO_TEAM
ARG TURBO_API
ARG TURBO_TOKEN

RUN rm -rf frontend/public/public
RUN rm -rf frontend/src/pages/api
RUN sed -i "s/CLIENT_VERSION_MISSING/${BUILD_VERSION}/" frontend/src/version.json
RUN yarn turbo run build --filter=frontend --no-cache --no-daemon

# RUNNER
FROM base
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /usr/src/app

COPY --from=builder --chown=node:node /usr/src/app/frontend/.next/standalone ./
COPY --from=builder --chown=node:node /usr/src/app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /usr/src/app/frontend/next.config.js ./frontend/next.config.js
COPY --from=builder /usr/src/app/frontend/public ./frontend/public

USER node

ENV PORT 3001
EXPOSE 3001/tcp

WORKDIR /usr/src/app/frontend
CMD ["node", "server.js"]
