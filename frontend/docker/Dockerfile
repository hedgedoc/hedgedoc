# SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: CC-BY-SA-4.0

# BUILD
FROM docker.io/node:18-alpine@sha256:a136ed7b0df71082cdb171f36d640ea3b392a5c70401c642326acee767b8c540 AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG BUILD_VERSION=CLIENT_VERSION_MISSING

ENV YARN_CACHE_FOLDER /tmp/.yarn
USER node
WORKDIR /usr/src/app

COPY --chown=node .yarn/plugins .yarn/plugins
COPY --chown=node .yarn/patches .yarn/patches
COPY --chown=node .yarn/releases .yarn/releases
COPY --chown=node .yarnrc.yml .yarnrc.yml
COPY --chown=node package.json package.json
COPY --chown=node yarn.lock yarn.lock
COPY --chown=node backend/package.json backend/
COPY --chown=node commons commons
COPY --chown=node frontend frontend
RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/tmp/.yarn \
    yarn install --immutable && yarn workspaces focus @hedgedoc/frontend

WORKDIR /usr/src/app/commons

RUN yarn build

WORKDIR /usr/src/app/frontend

RUN rm -rf public/public && \
    rm -rf src/pages/api && \
    sed -i "s/CLIENT_VERSION_MISSING/${BUILD_VERSION}/" src/version.json
RUN yarn build

# RUNNER
FROM docker.io/node:18-alpine@sha256:a136ed7b0df71082cdb171f36d640ea3b392a5c70401c642326acee767b8c540
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /usr/src/app

COPY --from=builder --chown=node:node /usr/src/app/frontend/.next/standalone ./
COPY --from=builder --chown=node:node /usr/src/app/frontend/.next/static ./.next/static
COPY --from=builder /usr/src/app/frontend/next.config.js next.config.js
COPY --from=builder /usr/src/app/frontend/public ./public

USER node

ENV PORT 3001
EXPOSE 3001/tcp
CMD ["node", "frontend/server.js"]
