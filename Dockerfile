# SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
#
# SPDX-License-Identifier: CC-BY-SA-4.0

# BUILD

FROM node:18 AS builder
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /usr/src/app
RUN chown -R node:node . /usr/src/app
USER node
COPY --chown=node . ./
RUN yarn install --immutable && \
    yarn build:for-real-backend && \
    rm -rf .next/cache

# RUNNER

FROM node:18-slim
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app
RUN chown node:node -R /app
COPY --chown=node package.json yarn.lock .yarnrc.yml ./
COPY --chown=node .yarn/ .yarn/
COPY --chown=node public/ public/
COPY --chown=node --from=builder /usr/src/app/.next/ .next/
USER node
RUN yarn workspaces focus --all --production && rm -rf .yarn/cache

EXPOSE 3001/tcp
CMD ["/usr/local/bin/yarn", "start:for-real-backend"]
