# SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: CC-BY-SA-4.0

# BUILD
FROM node:18-alpine AS builder
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app
COPY . ./
RUN yarn install --immutable && \
    yarn build:for-real-backend

# RUNNER
FROM node:18-alpine
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app
RUN chown node:node -R /app

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

USER node

EXPOSE 3001/tcp
CMD ["node", "server.js"]
