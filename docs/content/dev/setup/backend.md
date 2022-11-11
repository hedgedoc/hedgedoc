<!--
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

## Setting up the backend

**ToDo:** Document how to set up development environment using docker.

You need at least Node 14 (we recommend Node 18) and [yarn](https://yarnpkg.com/).
You MUST use yarn! There is no support for npm.

1. Clone this repo (e.g. `git clone https://github.com/hedgedoc/hedgedoc.git hedgedoc`)
2. Go into the backend directory (e.g. `cd hedgedoc/backend`)
3. Run `yarn install`
4. Create an environment file. We recommend to use the example file by running `cp .env.example .env`
   You can modify this file according to the [configuration documentation](../config/index.md).
5. Run `openssl rand -hex 16 | sed -E 's/(.*)/HD_SESSION_SECRET=\1/' >> .env` to generate a session secret if you have not set one manually before.
