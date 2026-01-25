# HedgeDoc 2 agent instructions

## Context about HedgeDoc 2

HedgeDoc 2 is a complete rewrite of the collaborative markdown editor HedgeDoc (formerly known as "CodiMD" or
"HackMD CE"). The main feature of HedgeDoc is the real-time collaboration on notes or slides (with reveal.js
integration). HedgeDoc 2 consists of a backend, a frontend, a package for commonly shared code, and some additional
components like markdown-it extensions.

## Repository structure

The repository is a monorepo consisting of multiple packages:

- `backend` contains the backend code (package `@hedgedoc/backend`)
- `frontend` contains the frontend code (package `@hedgedoc/frontend`)
- `commons` contains DTOs, interfaces and common code shared between frontend and backend (package `@hedgedoc/commons`)
- `markdown-it-plugins` contains plugins for markdown-it, used in frontend and backend (package `@hedgedoc/markdown-it-plugins`)
- `html-to-react` contains a library to convert HTML to React components (package `@hedgedoc/html-to-react`)
- `docs` contains the documentation of HedgeDoc 2 (a python mkdocs project)
- `dev-reverse-proxy` contains a Caddyfile to run a reverse proxy for local development

## Technologies

The app is written in modern TypeScript. The backend uses the NestJS framework with Knex.js for database
interactions. The frontend uses Next.js with React. For real-time collaboration, we use Yjs with a custom
WebSocket transport and CodeMirror 6 adapter. The frontend design is based on react-bootstrap components.

When introducing changes to the codebase, research the best practices to implement the feature or fix with
the used technologies.

## Commands

This repository uses the turborepo monorepo manager. All commands should be executed from the repository root.
Node modules in the different packages can be added or removed using `yarn workspace ` 

- Build the project: `yarn run build`
- Lint the code: `yarn run lint`
- Run format checks: `yarn run format`
- Fix linting issues: `yarn run lint:fix`
- Fix formatting issues: `yarn run format:fix`
- Run unit tests: `yarn run test`
- Run end-to-end tests: `yarn run test:e2e:ci`
- Start the built project: `yarn start`

All commands support the `--filter` option of turborepo to only run the command for a specific package.
For example, to build only the frontend run `yarn run build --filter=@hedgedoc/frontend`.
This can be done with any package of the monorepo.

Do not run any package scripts directly from the packages since these bypass the turbo CLI which ensures
that dependencies and caches are managed correctly.

## Testing

HedgeDoc 2 uses extensive testing to ensure correct functionality. We differentiate between unit tests
and end-to-end tests.

Unit tests should be created for each public function of a service in the backend or public utility function
in the frontend. Core components in the frontend that heavily rely on input data, should also have unit tests.

End-to-End tests in the backend are present for every API route. They use a new temporary database for each
test case, which is accordingly prepared. The tests ensure that API requests correctly result in the right
API responses.

There are some old cypress end-to-end tests in the frontend, which are currently outdated and not used.
Do not run them, or modify them. So for end-to-end tests, always run:
`yarn run test:e2e:ci --filter=@hedgedoc/backend`

## Linting, Formatting, Code style

HedgeDoc 2 uses the OXC toolchain with oxlint and oxfmt for linting and formatting.
Ignore rules should only be used, if strictly necessary, or a fix would require a lot more code.

Each package contains their relevant config for this, so that running the `lint` or `format` tasks
should work without further configuration.
When generating code, always include a `lint:fix` and a `format:fix` run afterward to ensure the code
quality is kept at a high level.

## License tooling

HedgeDoc 2 is licensed under AGPL-3.0-only. We use the reuse tool to ensure each file contains a valid license
notice in SPDX format. This copyright and license information should always be at the top of a file. The only
exception is when a directive such as `use client` is used. In this case the information should be below the
directive.

We have the following exceptions regards licensing:

- Binary files or files which can't contain a header should either have a file.license file next to it or should
  be listed in `REUSE.toml`.
- Configuration files that don't contain code but just configure the tooling for HedgeDoc should be licensed
  under CC0-1.0 license.
- The documentation in the `docs` package should usually be licensed under CC-BY-SA-4.0 license.
