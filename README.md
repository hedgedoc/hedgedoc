<!--
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

# HedgeDoc - React Client

![test, build](https://github.com/hedgedoc/react-client/workflows/test,%20build/badge.svg)
![e2e](https://github.com/hedgedoc/react-client/workflows/e2e/badge.svg)
![lint](https://github.com/hedgedoc/react-client/workflows/lint/badge.svg)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/hedgedoc/react-client.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/hedgedoc/react-client/context:javascript)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/hedgedoc/react-client.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/hedgedoc/react-client/alerts/)

This is the new, improved and better looking frontend for HedgeDoc 2.0.
Our goal is to recreate the current frontend in react and to improve it.

## UI Test

Curious about the new look and feel? We provide a demo of the new UI on [hedgedoc.dev](https://hedgedoc.dev). This
version uses mocked data and has no data persistence.

The UI test is hosted by [netlify](https://netlify.com). Please check
their [privacy policy](https://netlify.com/privacy) as well as [ours](https://hedgedoc.org/privacy-policy).

## Preparation

You need at least Node 14 (we recommend Node 18) and [yarn](https://yarnpkg.com/).
You MUST use yarn! There is no support for npm.

1. Clone this repo (e.g. `git clone https://github.com/hedgedoc/react-client.git hedgedoc-react-client`)
2. Go inside the repo (e.g. `cd hedgedoc-react-client`)
3. Run `yarn install`

## Development mode

To start the development mode run `yarn run dev`. If not configured otherwise the development mode will run in mock-mode which
emulates a hedgedoc backend.
If you want to use the development with a real hedgedoc backend then run `yarn run dev:for-real-backend` instead.
The app should run now and be available under [http://localhost:3001](http://localhost:3001) in your browser.
In development mode the app will autoload changes you make to the code.

## Production mode

Use `yarn build` to build the app in production mode and save it into the `.next` folder. The production build is minimized
and optimized for best performance. Don't edit them by hand!

You can run the production build using the built-in server with `yarn start`.
You MUST provide the environment variable `HD_EDITOR_BASE_URL` with protocol, domain and (if needed) path (
e.g. `http://127.0.0.1:3001/`) so the app knows under which URL it is available in the browser.
Optionally you can also provide `HD_RENDERER_BASE_URL` if the renderer should use another domain than the editor. This is
recommended for security reasons but not mandatory.

### Production mock build

It is also possible to create a production build that uses the emulated backend by using `yarn build:mock`.

## Using to backend and frontend together

To use backend and frontend together you'll need a reverse proxy that combines both services under one URL origin.
We provide a configuration for [caddy](https://caddyserver.com/) in the directory `dev-reverse-proxy`.

1. Make sure that the backend is running on port `3000` (which is the default), and that `HD_DOMAIN` is set
   to `http://localhost:8080`.
2. Start the frontend by using either running `yarn dev:for-real-backend` or by running a production build
   with `HD_EDITOR_BASE_URL` set to `http://localhost:8080/`.
3. Start the reverse proxy. You can use the script `run-caddy.sh` in the `dev-reverse-proxy` directory or download a
   caddy binary from [caddy](https://caddyserver.com/) and start it using `caddy run`.

## Running Tests

### Unit

Unit testing is done via jest.

1. Run `yarn test`

### End2End

We use [cypress](https://cypress.io) for e2e tests.

1. Start the frontend with `yarn dev:test` (or use a test build using `yarn build:test` which you can start
   using `yarn start`). The usage of `:test` is mandatory!
2. Run `yarn cy:open` to open the cypress test loader
3. Choose your browser and start a test suite

To run all tests in a headless browser use `yarn cy:run:chrome` or `yarn cy:run:firefox`

### Bundle analysis

You can inspect the generated production-bundle files to look for optimization issues.

1. run `yarn analyze`. This will overwrite any existing builds!
2. Open the generated `.next/server/analyze/server.html` in your favourite browser
