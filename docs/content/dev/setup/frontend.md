<!--
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Setting up the frontend

Follow the preparation instructions in [getting started](../getting-started.md)

## Development mode

### Mocked Backend Mode

To start the development mode run `yarn run dev`. If not configured otherwise the development mode will run in mock-mode
which
emulates a HedgeDoc backend.
The app should run now and be available under [http://localhost:3001](http://localhost:3001) in your browser.
In development mode the app will autoload changes you make to the code.

### With local backend

To start the development mode with an actual HedgeDoc backend use `yarn run dev:with-local-backend` instead.
This task will automatically set `HD_EDITOR_BASE_URL` to `http://localhost:8080`.

### Performance

The development mode compiles everything on demand. So the first time you open a page in the browser it may take some
time.

## Production mode

Use `yarn build` to build the app in production mode and save it into the `.next` folder. The production build is
minimized
and optimized for best performance. Don't edit the generated files in the `.next` folder by hand!

You can run the production build using the built-in server with `yarn start`.
You MUST provide the environment variable `HD_EDITOR_BASE_URL` with protocol, domain and (if needed) subdirectory path (
e.g. `http://localhost:3001/`) so the app knows under which URL the frontend is available in the browser.

### Production mock build

It is also possible to create a production build that uses the emulated backend by using `yarn build:mock`. This is
usually not needed except for demonstration purposes like `https://hedgedoc.dev`.

## Environment Variables

The following environment variables are recognized by the frontend process.

| Name                     | Possible Values                                                                                                                  | Description                                                                                                                                                                                                              |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| HD_EDITOR_BASE_URL       | Any URL with protocol, domain and optionally directory and port. Must end with a trailing slash. (e.g. `http://localhost:3001/`) | The URL under which the frontend is expected. Setting this is mandatory so the server side rendering can generate assets URLs. You only need to set this yourself if you use the production mode.                        |
| HD_RENDERER_BASE_URL     | Same as `HD_EDITOR_BASE_URL`                                                                                                     | You can provide this variable if the renderer should use another domain than the editor. This is recommended for security reasons but not mandatory. This variable is optional and will fallback to `HD_EDITOR_BASE_URL` | 
| NEXT_PUBLIC_USE_MOCK_API | `true`, `false`                                                                                                                  | Will activate the mocked backend                                                                                                                                                                                         |
| NEXT_PUBLIC_TEST_MODE    | `true`, `false`                                                                                                                  | Will activate additional HTML attributes that are used to identify elements for test suits.                                                                                                                              |

Variables that start with `NEXT_PUBLIC_` will be compiled into the build. You can't change them at after compilation.
You shouldn't need to set them yourself. Use the designated npm tasks instead.

## UI Test

Curious about the new look and feel? We provide a demo of the new UI on [hedgedoc.dev](https://hedgedoc.dev). This
version uses mocked data and has no data persistence.

The UI test is hosted by [netlify](https://netlify.com). Please check
their [privacy policy](https://netlify.com/privacy) as well as [ours](https://hedgedoc.org/privacy-policy).

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
