# Getting started

This document will help you with setting up the development environment for HedgeDoc 2.

## Preparation

### Preparing the directory

1. Make sure that NodeJS is installed. You need at least Node 14 (we recommend Node 18).
2. Make sure that [yarn](https://yarnpkg.com/) is installed.
3. Clone this repo (e.g. `git clone https://github.com/hedgedoc/hedgedoc.git hedgedoc`)
4. Go into the cloned directory

### Installing the dependencies

Because we use yarn workspaces, yarn collects the dependencies of all packages automatically in one central top-level node_modules folder.
To install the dependencies execute `yarn install` at the top level of the cloned repository.
Execute this command ONLY there. There is no need to execute the install-command for every package.
It's important to use [yarn](https://yarnpkg.com/). We don't support npm or any other package manager and using anything else than yarn won't work. 

### Compile the commons package
Some code is shared by backend and frontend. This code lives in the "common" package and needs to be compiled so frontend and backend can import it.
This only needs to be done once, except if you've changed code in the commons package.
1. Go into the `commons` directory.
2. Execute `yarn build` to build the commons package.

## Setting up the backend

1. Go into the `backend` directory.
2. Create an environment file. We recommend to use the example file by running `cp .env.example .env`
   You can modify this file according to the [configuration documentation](../config/index.md).
3. Make sure that you've set `HD_SESSION_SECRET` in your `.env` file. Otherwise, the backend won't start. 
   > In dev mode you don't need a secure secret. So use any value. If you want to generate a secure session secret you can generate one using e.g. `openssl rand -hex 16 | sed -E 's/(.*)/HD_SESSION_SECRET=\1/' >> .env`.

## Setting up the frontend

The instructions for the frontend can be found [here](./setup/frontend.md).

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
