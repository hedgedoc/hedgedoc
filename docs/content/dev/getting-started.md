# Getting started

## Preparing for running the backend code

**ToDo:** Document how to setup development environment using docker.

1. Clone the repository with `git clone https://github.com/hedgedoc/hedgedoc.git`
   (cloning is the preferred way, but you can also download and unzip a release)

2. Enter the directory and run `yarn install`.

3. Run `cp .env.example .env` to use the example configuration.

   Alternatively, set up a [.env](../config/index.md) or set up
   [environment variables](../config/index.md) yourself.
   
4. Run `openssl rand -hex 16 | sed -E 's/(.*)/HD_SESSION_SECRET=\1/' >> .env` to generate a session secret if you have not set one manually before.
 
 ## Preparing for running the frontend code

**ToDo:** Document how to setup development environment using docker.

1. Clone the repository with `git clone https://github.com/hedgedoc/react-client.git`
   (cloning is the preferred way, but you can also download and unzip a release)

2. Enter the directory and run `yarn install`.

## Running Hedgedoc with auto-reload

We will run Hedgedoc in development mode, which means the backend and frontend will automatically rebuild or restart when you make changes.

The commands will stay active in your terminal, so you will need multiple tabs
to run both at the same time.

1. Enter the `react-frontend` directory and use `yarn start` if you want webpack to continuously rebuild the frontend
   code.
   
   **Note:** Currently, this will not result in the backend and frontend communicating with each other.
   
   **Note:** You can run `yarn start:for-real-backend` to start a frontend, which tries to connect to a local backend.

2. To auto-reload the server, enter the `hedgedoc` directory and run `yarn start:dev`.

## Testing

- The backend will be available at `http://localhost:3000`.
- The frontend will be available at `http://localhost:3001`.

**Note:** The backend also proxies requests to the frontend, so you can point also your browser at the backend.
