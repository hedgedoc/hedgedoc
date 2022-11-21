# SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: CC-BY-SA-4.0

# BUILD
FROM node:18-alpine@sha256:9eff44230b2fdcca57a73b8f908c8029e72d24dd05cac5339c79d3dedf6b208b AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG BUILD_VERSION=CLIENT_VERSION_MISSING

WORKDIR /app
COPY --chown=node .yarn ../.yarn
COPY --chown=node frontend ./
RUN rm -rf public/public && \
    rm -rf src/pages/api && \
    yarn install --immutable && \
    sed -i "s/CLIENT_VERSION_MISSING/${BUILD_VERSION}/" src/version.json && \
    yarn build

# RUNNER
FROM node:18-alpine@sha256:9eff44230b2fdcca57a73b8f908c8029e72d24dd05cac5339c79d3dedf6b208b
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/.next/standalone ./

USER node

ENV PORT 3001
EXPOSE 3001/tcp
CMD ["node", "server.js"]
