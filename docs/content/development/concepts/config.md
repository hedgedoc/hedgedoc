# Config

!!! info "Design Document"
    This is a design document, explaining the design and vision for a HedgeDoc 2
    feature. It is not a user guide and may or may not be fully implemented.

The configuration of HedgeDoc 2 is handled entirely by environment variables.
Most of these variables are prefixed with `HD_` (for HedgeDoc).
NestJS - the framework we use - is reading the variables from the environment and also from
the `.env` file in the root of the project.

## How the config code works

The config of HedgeDoc is split up into **nine** different modules:

`app.config.ts`
: General configuration of the app

`auth.config.ts`
: Which authentication providers are available and which options are set

`csp.config.ts`
: Configuration for [Content Security Policy][csp]

`customization.config.ts`
: Config to customize the instance and set instance specific links

`database.config.ts`
: Which database should be used

`external-services.config.ts`
: Which external services are activated and where can they be called

`media.config.ts`
: Where media files are being stored

`note.config.ts`
: Configuration for notes

Each of those files (except `auth.config.ts` which is discussed later) consists of three parts:

1. An interface
2. A Joi schema
3. A default export

### Interface

The interface just describes which options the configuration has and how the rest of HedgeDoc can
use them. All enums that are used in here are put in their own files with the extension `.enum.ts`.

### Joi Schema

We use [Joi][joi] to validate each provided configuration to make sure the configuration of the user
is sound and provides helpful error messages otherwise.

The most important part here is that each value ends with `.label()`. This names the
environment variable that corresponds to each config option. It's very important that each config
option is assigned the correct label to have meaningful error messages that benefit the user.

Everything else about how Joi works and how you should write schemas can
be read in [their documentation][joi-doc].

### A default export

The default exports are used by NestJS to provide the values to the rest of the application.
We mostly do four things here:

1. Populate the config interface with environment variables, creating the config object.
2. Validate the config object against the Joi schema.
3. Polish the error messages from Joi and present them to the user (if any occur).
4. Return the validated config object.

## How `auth.config.ts` works

Because it's possible to configure some authentication providers multiple times
(e.g. multiple LDAPs or GitLabs), we use user defined environment variable names.
With the user defined names it's not possible to put the correct labels in the schema
or build the config objects as we do in every other file.

Therefore, we have two big extra steps in the default export:

1. To populate the config object we have some code at the top of the default export to gather all
   configured variables into arrays.
2. The error messages are piped into the util method `replaceAuthErrorsWithEnvironmentVariables`.
   This replaces the error messages of the form `gitlab[0].providerName`
   with `HD_AUTH_GITLAB_<nameOfFirstGitlab>_PROVIDER_NAME`. For this the util function gets
   the error, the name of the config option (e.g `'gitlab'`), the approriate prefix
   (e.g. `'HD_AUTH_GITLAB_'`), and an array of the user defined names.

## Mocks

Some config files also have a `.mock.ts` file which defines the configuration for the e2e tests.
Those files just contain the default export and return the mock config object.

[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
[joi]: https://joi.dev/
[joi-doc]: https://joi.dev/api
