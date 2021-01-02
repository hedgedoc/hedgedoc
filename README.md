<!--
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

# HedgeDoc - React Client

![test, build](https://github.com/hedgedoc/react-client/workflows/test,%20build/badge.svg)
![e2e](https://github.com/hedgedoc/react-client/workflows/e2e/badge.svg)
![lint](https://github.com/hedgedoc/react-client/workflows/lint/badge.svg)

This is the new, improved and better looking frontend for HedgeDoc 2.0.
Our goal is to recreate the current frontend in react and to improve it.

## Preparation
You'll need at least Node 12. We use [yarn](https://yarnpkg.com/) for our dependencies.

## Development mode

1. Clone this repo (e.g. `git clone https://github.com/hedgedoc/react-client.git hedgedoc-react-client`)
2. Go inside the repo (e.g. `cd hedgedoc-react-client`)
3. Run `yarn install`
4. Either run
    - `yarn start` - Calls only mocked version of the api. Doesn't need a HedgeDoc backend.
    - `yarn start:for-real-backend` - Expects [a HedgeDoc backend server](https://github.com/hedgedoc/hedgedoc/tree/develop) running under [http://localhost:3000](http://localhost:3000))

This should run the app in the development mode and open [http://localhost:3001](http://localhost:3001) in your browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### Tests

#### Unit

Unit testing is done via jest.

1. Run `yarn test`

#### End2End

We use [cypress](https://cypress.io) for e2e tests.

1. Start the frontend with `yarn start:test` in dev test mode or build a test build with `yarn build:test` which you can serve with `yarn serve:build`
   Don't use the regular start/build command, or the tests will fail!
2. Run `yarn cy:open` to open the cypress test loader
3. Choose your browser and test
4. Let the tests run

### Bundle analysis
You can inspect the generated production-bundle files to look for optimization issues.

1. Run `yarn analyze`
2. Open the generated `build/report.html` in your favourite browser

## Production mode

1. Clone this repo (e.g. `git clone https://github.com/hedgedoc/react-client.git hedgedoc-react-client`)
2. Go inside the repo (e.g. `cd hedgedoc-react-client`)
3. Run `yarn install`
4. Run `yarn build`

This will build the app in production mode and save it into the `build` folder.
The production build is optimized for best performance, minimized
 and the filenames include a hash value of the content. Don't edit them by hand!

