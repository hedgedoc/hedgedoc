# Frontend

## Environment Variables

The following environment variables are recognized by the frontend process.

| Name                     | Possible Values                                                                                                                  | Description                                                                                                                                                                                                       |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| HD_BASE_URL              | Any URL with protocol, domain and optionally directory and port. Must end with a trailing slash. (e.g. `http://localhost:3001/`) | The URL under which the frontend is expected. Setting this is mandatory so the server side rendering can generate assets URLs. You only need to set this yourself if you use the production mode.                 |
| HD_RENDERER_BASE_URL     | Same as `HD_BASE_URL`                                                                                                            | You can provide this variable if the renderer should use another domain than the editor. This is recommended for security reasons but not mandatory. This variable is optional and will fallback to `HD_BASE_URL` |
| NEXT_PUBLIC_USE_MOCK_API | `true`, `false`                                                                                                                  | Will activate the mocked backend                                                                                                                                                                                  |
| NEXT_PUBLIC_TEST_MODE    | `true`, `false`                                                                                                                  | Will activate additional HTML attributes that are used to identify elements for test suits.                                                                                                                       |

Variables that start with `NEXT_PUBLIC_` will be compiled into the build. You can't change them
after compilation. You shouldn't need to set them yourself. Use the designated npm tasks instead.

## UI Test

Curious about the new look and feel? We provide a demo of the new UI on
[HedgeDoc.dev][hedgedoc-dev]. This version is reset every day, so data is not persisted.

Please see also our [privacy policy][privacy].

## Running Tests

### Unit

Unit testing is done via jest.

1. Run `yarn test`

### End2End

We use [cypress][cypress] for e2e tests.

1. Start the frontend with `yarn start:dev:test` (or use a test build using `yarn build:test`
   which you can start using `yarn start`). The usage of `:test` is mandatory!
2. Run `yarn test:e2e:open` to open the cypress test loader
3. Choose your browser and start a test suite

To run all tests in a headless browser use `yarn test:e2e`

### Bundle analysis

You can inspect the generated production-bundle files to look for optimization issues.

1. run `yarn analyze`. This will overwrite any existing builds!
2. Open the generated `.next/server/analyze/server.html` in your favourite browser

## Enable Debug Logging in Production

The debug logger can be enabled in production by setting `debugLogging` in the browser's
local storage to `true`. This can be done e.g. by executing this JavaScript command
in the browser's console.

```javascript
window.localStorage.setItem("debugLogging", "true");
```

[hedgedoc-dev]: https://hedgedoc.dev
[privacy]: https://hedgedoc.org/privacy-policy
[cypress]: https://cypress.io
