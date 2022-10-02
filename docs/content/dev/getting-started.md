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

## Running backend and frontend together

The documentation for setting up the frontend and how to use it and the backend together can be found in the [frontend repository README](https://github.com/hedgedoc/react-client/blob/main/README.md).
