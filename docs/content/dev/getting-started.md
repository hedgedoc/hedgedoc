# Getting started

## Preparing for running the backend code

**ToDo:** Document how to set up development environment using docker.

1. Clone the repository with `git clone https://github.com/hedgedoc/hedgedoc.git`
   (cloning is the preferred way, but you can also download and unzip a release)

2. Enter the directory and run `yarn install`.

3. Run `cp .env.example .env` to use the example configuration.

   Alternatively, set up a [.env](../config/index.md) or set up
   [environment variables](../config/index.md) yourself.
   
4. Run `openssl rand -hex 16 | sed -E 's/(.*)/HD_SESSION_SECRET=\1/' >> .env` to generate a session secret if you have not set one manually before.
 
## Preparing for running the frontend code

**ToDo:** Document how to set up development environment using docker.

1. Clone the repository with `git clone https://github.com/hedgedoc/react-client.git`
   (cloning is the preferred way, but you can also download and unzip a release)

2. Enter the directory and run `yarn install`.

## Running HedgeDoc with auto-reload

We will run HedgeDoc in development mode, which means the backend and frontend will automatically rebuild or restart when you make changes.

The commands will stay active in your terminal, so you will need multiple tabs
to run both at the same time.

1. Enter the `react-frontend` directory and use `yarn start:for-real-backend` if you want webpack to continuously rebuild the frontend code. The frontend will expect a running backend at port 3000.
   
   **Note:** You can run `yarn start` to start a frontend with an integrated, mocked API. This may support more features than the real backend.

2. To start the server in auto-reload mode, enter the `hedgedoc` directory and run `env NODE_ENV=development yarn start:dev`.

## Testing

- After starting both frontend and backend, HedgeDoc will be available at `http://localhost:3000`.

**Note:** If you only started the frontend, it will be available at `http://localhost:3001`.

**Note:** If you want to use HedgeDoc with the real backend, point your browser at `http://localhost:3000`, as the backend proxies requests to the frontend and you'll get CORS errors if you try to use the frontend directly.
