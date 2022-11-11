# Getting started

## Preparation

Setup the [backend](./setup/backend.md) and the [frontend](./setup/frontend.md).

## Running backend and frontend together

To use backend and frontend together in development mode you'll need a local reverse proxy that combines both services under one URL origin.
We recommend to use our pre-configured [caddy](https://caddyserver.com/) configuration.

### Prepare the backend

In the `backend` directory
1. make sure that `HD_DOMAIN` in `.env` is set to `http://localhost:8080`.
2. start the backend by running `yarn start:dev`.  

### Preparing the frontend

In the frontend directory
1. Start the frontend in dev or production mode using any method described in the [frontend setup documentation](./setup/frontend.md). 
   If you use the production build then make sure that you set the environment variable `HD_EDITOR_BASE_URL` to the same value as `HD_DOMAIN` in the backend.

### Running the reverse proxy

1. Download the latest version of caddy from [the caddy website](https://caddyserver.com/). You don't need any plugin. Place the downloaded binary in the directory `dev-reverse-proxy`. Don't forget to mark the file as executable using `chmod +x caddy`
2. Start the reverse proxy using `./caddy run`.
3. Open your browser on http://localhost:8080
