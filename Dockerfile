FROM node:lts-alpine as base
FROM base as builder
WORKDIR /home/node/app

RUN apk update && apk add git

# Install dependencies first to not invalidate the cache on every source change
COPY package.json yarn.lock ./
RUN yarn install --production=false --pure-lockfile

# Copy stuff needed to build the frontend
COPY locales locales
COPY public public
COPY webpack.*.js .babelrc ./

# Build the frontend
RUN yarn run build

# Remove all devDependencies
RUN yarn install --production=true --pure-lockfile

# Production container
FROM base

# Setup various metadata
WORKDIR /home/node/app
USER node
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK CMD node healthcheck.mjs
CMD ["node", "app.js"]

# Copy built app last to leverage caching
COPY --from=builder --chown=node:node /home/node/app .
COPY --chown=node:node lib lib
COPY --chown=node:node bin/cleanup bin/cleanup
COPY --chown=node:node docker/healthcheck.mjs .
COPY --chown=node:node app.js ./
