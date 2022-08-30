# SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: CC-BY-SA-4.0

# BUILD
FROM node:18-alpine AS builder
ARG BUILD_VERSION=CLIENT_VERSION_MISSING
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app
COPY . ./
RUN yarn install --immutable && \
    sed -i "s/CLIENT_VERSION_MISSING/${BUILD_VERSION}/" src/version.json && \
    yarn build:for-real-backend

# RUNNER
FROM node:18-alpine
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/.next/standalone ./

USER node

ENV PORT 3000
EXPOSE 3000/tcp
CMD ["node", "server.js"]
