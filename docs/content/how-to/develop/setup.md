# Development Setup

To run HedgeDoc 2.0 you need three components: the backend, the frontend and the reverse proxy.

Backend and Frontend are included in the [HedgeDoc repo][hedgedoc-repo].
The reverse proxy can be chosen by preference. For development, we recommend caddy
and the provided configuration.

## Quick guide for development setup

This describes the easiest way to start a local development environment. For other deployments
follow the description below.
To run HedgeDoc 2.0 you need three components: the backend, the frontend and the reverse proxy.

Backend and Frontend are included in the [HegdeDoc repo][hedgedoc-repo].
The reverse proxy can be chosen by preference. For development, we recommend caddy
and the provided configuration.

1. Clone [our repository][hedgedoc-repo] and go into its directory

   <!-- markdownlint-disable proper-names -->
   ```shell
   git clone https://github.com/hedgedoc/hedgedoc.git
   cd hedgedoc
   ```
   <!-- markdownlint-enable proper-names -->

2. Install Node.js. You need at least Node 20.
3. Install [Yarn][yarn]
4. Install Caddy (select one of the two options)
   - [Download][caddy] and place the `caddy` binary in `dev-reverse-proxy`.
     Ensure it is executable with `chmod +x caddy`. Users of macOS may need to run
     `xattr -d com.apple.quarantine ./caddy` to lift the quarantine for executables
     from the internet.
   - Install Caddy using your package manager
5. Install the dependencies in repo root directory with `yarn install`
6. Create the `.env` config file by copying the example: `cp .env.example .env`
7. Run `yarn start:dev`
   > This will execute the backend, frontend and reverse proxy at once
8. Use your browser to go to <http://localhost:8080>. This may take a while because everything is
   compiled on the fly.

## More detailed development setup

The following sections describe a more detailed setup of all components.

## Preconditions

If you want to run HedgeDoc in dev mode some preconditions have to be met.

1. Make sure that Node.js is installed. You need at least Node 20.
2. Make sure that [Yarn][yarn] is installed.
   <!-- markdownlint-disable proper-names -->
3. Clone this repo (e.g. `git clone https://github.com/hedgedoc/hedgedoc.git hedgedoc`)
   <!-- markdownlint-enable proper-names -->
4. Go into the cloned directory

## Installing the dependencies

Because we use Yarn workspaces, Yarn collects the dependencies of all packages automatically in one
central top-level `node_modules` folder.
To install the dependencies execute `yarn install` at the top level of the cloned repository.
Execute this command ONLY there. There is no need to execute the install-command for every package.
It's important to use [Yarn][yarn]. We don't support `npm` or any other package
manager and using anything else than Yarn won't work.

## Create the configuration

HedgeDoc 2 is configured using environment variables.
For development, we recommend creating an `.env` file.

1. Create an `.env` file. We recommend to use the example file by running `cp .env.example .env`
   You can modify this file according to the [configuration documentation][config-docs].
2. Make sure that you've set `HD_SESSION_SECRET` in your `.env` file. Otherwise, the backend
   won't start.
   > In dev mode you don't need a secure secret. So use any value. If you want to generate a secure
   > session secret you can use
   > e.g. `openssl rand -hex 16 | sed -E 's/(.*)/HD_SESSION_SECRET=\1/' >> .env`.
3. Make sure that `HD_BASE_URL` in `.env` is set to the base url where HedgeDoc should be available.
   In local dev environment this is most likely `http://localhost:8080`.

## Build the `commons` package

Some code is shared by backend and frontend. This code lives in the `commons` package and needs
to be built so frontend and backend can import it.
This only needs to be done once, except if you've changed code in the commons package.

1. Go into the `commons` directory.
2. Execute `yarn build` to build the commons package.

## Setting up the Backend

**Note:** The backend can be mocked instead of starting it for real. This is useful,
if you just want to work on the frontend. See the "Mocked backend" section below.

1. Go into the `backend` directory.
2. Start the backend by running `yarn start:dev` for dev mode or `yarn start` for production.

## Setting up the frontend

The frontend can be run in four different ways. The development mode compiles everything on demand.
So the first time you open a page in the browser it may take some time.
[See here][frontend-setup] for a more detailed description of the environment variables
for the frontend. A special configuration isn't necessary but keep in mind that you execute
all commands from within the `frontend` directory.

### Mocked backend

This task will run the frontend in mock-mode, meaning instead of running a real backend, the
frontend mocks the backend. This way you can work on frontend functionality without starting up the
full development environment. The downside of this method is that you can't save notes and that
realtime collaboration features are not available. To start the development mode,
run `yarn start:dev:mock`. The app should run now and be available under
<http://localhost:3001> in your browser.

### With local backend

To start the development mode with an actual HedgeDoc backend use `yarn start:dev` instead.
This task will automatically set `HD_BASE_URL` to `http://localhost:8080`.

### Production mode

Use `yarn build` to build the app in production mode and save it into the `.next` folder.
The production build is minimized and optimized for best performance. Don't edit the generated
files in the `.next` folder in any way!

You can run the production build using the built-in server with `yarn start`.
You MUST provide the environment variable `HD_BASE_URL` with protocol, domain and (if needed)
subdirectory path (e.g. `http://localhost:3001/`) so the app knows under which URL the frontend
is available in the browser.

If you use the production build then make sure that you set the environment variable `HD_BASE_URL`
to the same value as `HD_BASE_URL` in the backend.

### Production mock build

It is also possible to create a production build that uses the emulated backend by using
`yarn build:mock`. This is usually not needed except for demonstration purposes like
`https://hedgedoc.dev`.

## Running backend and frontend together

To use backend and frontend together in development mode you'll need a local reverse proxy that
combines both services under one URL origin.
We recommend to use our pre-configured [Caddy][caddy] configuration.

### Running the reverse proxy

1. Download the latest version of Caddy from [the Caddy website][caddy] or alternatively install
   it using your package manager. You don't need any plugin. Place the downloaded binary in
   the directory `dev-reverse-proxy`. Don't forget to mark the file as executable using
   `chmod +x caddy`. Users of macOS may need to run `xattr -d com.apple.quarantine ./caddy`
   to lift the quarantine for executables from the internet.
2. Start Caddy using `./caddy run` (if you downloaded the binary manually) or `caddy run`
   (if you installed Caddy via a package manager).
3. Open your browser on <http://localhost:8080>

It is also possible to use another domain and port other than `localhost:8080`.
To do so, you need to set the `HD_BASE_URL` environment variable accordingly.
Furthermore, for Caddy to work with a domain name (possibly creating TLS certificates),
set `CADDY_HOST` to your domain (for example `CADDY_HOST=http://my-hedgedoc.home:9000`).

[hedgedoc-repo]: https://github.com/hedgedoc/hedgedoc
[yarn]: https://yarnpkg.com/getting-started/install
[caddy]: https://caddyserver.com/
[config-docs]: ../../references/config/index.md
[frontend-setup]: ./frontend.md
