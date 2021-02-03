# Config

The configuration of HedgeDoc is handled entirely by environment variables. Most of these variables are prefixed with `HD_` (for HedgeDoc).

## Configuring HedgeDoc for development

NestJS - the framework we use - is reading the variables from the environment and also from the `.env` file in the root of the project. To make it easy to get the project started we included an example `.env` file in the root of this project called `.env.example`.

## How the config code works

The config of HedgeDoc is split up into **six** different modules:

`app.config.ts`
: General configuration of the app

`auth.config.ts`
: Which authentication providers are available and which options are set

`csp.config.ts`
: Configuration for [Content Security Policy][csp]

`database.config.ts`
: Which database should be used

`hsts.config.ts`
: Configuration for [HTTP Strict-Transport-Security][hsts]

`media.config.ts`
: Where media files are being stored

Each of those files (except `auth.config.ts` which is discussed later) consists of three parts:

1. An Interface
2. A Joi schema
3. A default export

### Interface

The interface just describes what options the configuration has and how the rest of HedgeDoc can use them. All enums that are used in here are put in their own files with the extension `.enum.ts`.

### Joi Schema

We use [Joi][joi] to validate each provided configuration to make sure the configuration of the user is sound and provide helpful error messages if that's not the case.

The most important part here is that each value has a `.label()` at the end. With this the environment variable name that corresponds to each config option is described. It's very important that each config options is given the correct label to have meaningful error messages that benefit the user.

Everything else about how Joi works and how you should write schemas can be read in [their documentation][joi-doc].

### A default export

The default exports are used by NestJS to provide the values to the rest of the application. We mostly do four things here:

1. Populate the config interface with environment variables, creating the config object.
2. Validate the config object against the Joi schema.
3. Work on the error messages from Joi and present them to the user (if any occur).
4. Return the validated config object.

## How `auth.config.ts` works

Because it's possible to configure some authentication provider more than once (multiple LDAPs, multiple GitLabs) and we don't know how many, we use user defined environment variable names. With the user defined names it's not possible to put the correct labels in the schema or build the config objects as we do in every other file.

Therefore, we have two big extra steps in the default export:
1. To populate the config object we have some code at the top of the default export to gather all configured variables into arrays. 
2. The error messages are piped into the util method `replaceAuthErrorsWithEnvironmentVariables`.  This replaces the error messages of the form `gitlab[0].providerName` with `HD_AUTH_GITLAB_<nameOfFirstGitlab>_PROVIDER_NAME`. For this the util functions gets the error, the name of the config option (e.g `'gitlab'`), the approriate prefix (e.g. `'HD_AUTH_GITLAB_'`), and an array of the user defined names.

## Mocks

Some config files also have a `.mock.ts` file in which the configuration for the e2e tests is defined. Those files just contain the default export and returns the mock config object.


[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
[hsts]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
[joi]: https://joi.dev/
[joi-doc]: https://joi.dev/api
