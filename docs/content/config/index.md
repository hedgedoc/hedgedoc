# Configuration

HedgeDoc can be configured via environment variables either directly or via an `.env` file.

## The `.env` file

The `.env` file should be placed in the root of the project and contains key-value pairs of
environment variables and their corresponding value. This can for example look like this:

<!-- markdownlint-disable proper-names -->
```ini
HD_BASE_URL="http://localhost:8080"
HD_SESSION_SECRET="change_me_in_production"
HD_DATABASE_TYPE="sqlite"
HD_DATABASE_NAME="./hedgedoc.sqlite"
HD_MEDIA_BACKEND="filesystem"
HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH="uploads/"
```
<!-- markdownlint-enable proper-names -->

We also provide an `.env.example` file containing a minimal configuration
in the root of the project. This should help you to write your own configuration.

!!! warning  
    The minimal configuration provided in `.env.example` is exactly that: minimal.  
    It will let you start HedgeDoc for local development,
    but it is **not** meant to be used in production without prior changes.

## General

| environment variable     | default                | example                     | description                                                                                                                                            |
| ------------------------ | ---------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `HD_BASE_URL`            | -                      | `https://md.example.com`    | The URL the HedgeDoc instance is accessed with, like it is entered in the browser                                                                      |
| `HD_BACKEND_PORT`        | 3000                   |                             | The port the backend process listens on.                                                                                                               |
| `HD_FRONTEND_PORT`       | 3001                   |                             | The port the frontend process listens on.                                                                                                              |
| `HD_RENDERER_BASE_URL`   | Content of HD_BASE_URL |                             | The URL the renderer runs on. If omitted this will be the same as `HD_BASE_URL`.                                                                       |
| `HD_LOGLEVEL`            | warn                   |                             | The loglevel that should be used. Options are `error`, `warn`, `info`, `debug` or `trace`.                                                             |
| `HD_FORBIDDEN_NOTE_IDS`  | -                      | `notAllowed,alsoNotAllowed` | A list of note ids (separated by `,`), that are not allowed to be created or requested by anyone.                                                      |
| `HD_MAX_DOCUMENT_LENGTH` | 100000                 |                             | The maximum length of any one document. Changes to this will impact performance for your users.                                                        |
| `HD_PERSIST_INTERVAL`    | 10                     | `0`, `5`, `10`, `20`        | The time interval in **minutes** for the periodic note revision creation during realtime editing. `0` deactivates the periodic note revision creation. |

### Why should I want to run my renderer on a different (sub-)domain?

If the renderer is provided by another domain, it's way harder to manipulate HedgeDoc or
steal credentials from the rendered note content, because renderer and editor are more isolated.
This increases the security of the software and greatly mitigates [XSS attacks][xss].
However, you can run HedgeDoc without this extra security, but we recommend using it if possible.

!!! note
    When you want to use a separate domain for `HD_RENDERER_BASE_URL`, your reverse proxy
    config needs to be adjusted to direct requests for this domain to the frontend.

## Notes

| environment variable              | default | example                           | description                                                                                                                                                                          |
| --------------------------------- | ------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `HD_FORBIDDEN_NOTE_IDS`           | -       | `notAllowed, alsoNotAllowed`      | A list of note ids (separated by `,`), that are not allowed to be created or requested by anyone.                                                                                    |
| `HD_MAX_DOCUMENT_LENGTH`          | 100000  |                                   | The maximum length of any one document. Changes to this will impact performance for your users.                                                                                      |
| `HD_GUEST_ACCESS`                 | `write` | `deny`, `read`, `write`, `create` | Defines the maximum access level for guest users to the instance. If guest access is set lower than the "everyone" permission of a note then the note permission will be overridden. |
| `HD_PERMISSION_DEFAULT_LOGGED_IN` | `write` | `none`, `read`, `write`           | The default permission for the "logged-in" group that is set on new notes.                                                                                                           |
| `HD_PERMISSION_DEFAULT_EVERYONE`  | `read`  | `none`, `read`, `write`           | The default permission for the "everyone" group (logged-in & guest users), that is set on new notes created by logged-in users. Notes created by guests always set this to "write".  |

## Authentication

!!! info
    HedgeDoc 2 does not yet support all authentication backends from HedgeDoc 1.
    You can follow [this issue](https://github.com/hedgedoc/hedgedoc/issues/1006) for details.

### Local

HedgeDoc provides local accounts, handled internally. This feature only provides basic
functionality, so for most environments we recommend using an external authentication mechanism,
which also enable more secure authentication like 2FA or WebAuthn.

| environment variable                      | default | example                 | description                                                                           |
| ----------------------------------------- | ------- | ----------------------- | ------------------------------------------------------------------------------------- |
| `HD_AUTH_LOCAL_ENABLE_LOGIN`              | `false` | `true`, `false`         | This makes it possible to use the local accounts in HedgeDoc.                         |
| `HD_AUTH_LOCAL_ENABLE_REGISTER`           | `false` | `true`, `false`         | This makes it possible to register new local accounts in HedgeDoc.                    |
| `HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH` | `2`     | `0`, `1`, `2`, `3`, `4` | The minimum [zxcvbn-ts][zxcvbn-ts-score] password score, that passwords need to have. |

#### Password score

The password score is calculated with [zxcvbn-ts][zxcvbn-ts-score].

| score | meaning                                                           | minimum number of guesses required (approximated) |
| :---: | ----------------------------------------------------------------- | ------------------------------------------------- |
|   0   | All passwords are allowed                                         | -                                                 |
|   1   | Only `too guessable` passwords are disallowed                     | 1.000                                             |
|   2   | `too guessable` and `very guessable` passwords are disallowed     | 1.000.000                                         |
|   3   | `safely unguessable` and `very unguessable` passwords are allowed | 100.000.000                                       |
|   4   | Only `very unguessable` passwords are allowed                     | 10.000.000.000                                    |

### LDAP

HedgeDoc can use one or multiple LDAP servers to authenticate users. To do this,
you first need to tell HedgeDoc the names of servers you want to use (`HD_AUTH_LDAP_SERVERS`),
and then you need to provide the configuration for those LDAP servers
depending on how you want to use them.
Each of those variables will contain the given name for this LDAP server.
For example if you named your LDAP server `MY_LDAP` all variables for this server
will start with `HD_AUTH_LDAP_MY_LDAP`.

| environment variable                       | default              | example                                            | description                                                                                                   |
| ------------------------------------------ | -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `HD_AUTH_LDAP_SERVERS`                     | -                    | `MY_LDAP`                                          | A comma-seperated list of names of LDAP servers HedgeDoc should use.                                          |
| `HD_AUTH_LDAP_$NAME_PROVIDER_NAME`         | `LDAP`               | `My LDAP`                                          | The display name for the LDAP server, that is shown in the UI of HegdeDoc.                                    |
| `HD_AUTH_LDAP_$NAME_URL`                   | -                    | `ldaps://ldap.example.com`                         | The url with which the LDAP server can be accessed.                                                           |
| `HD_AUTH_LDAP_$NAME_SEARCH_BASE`           | -                    | `ou=users,dc=LDAP,dc=example,dc=com`               | The LDAP search base which contains the user accounts on the LDAP server.                                     |
| `HD_AUTH_LDAP_$NAME_SEARCH_FILTER`         | `(uid={{username}})` | `(&(uid={{username}})(objectClass=inetOrgPerson))` | A LDAP search filter that filters the users that should have access.                                          |
| `HD_AUTH_LDAP_$NAME_SEARCH_ATTRIBUTES`     | -                    | `username,cn`                                      | A comma-seperated list of attributes that the search filter from the LDAP server should access.               |
| `HD_AUTH_LDAP_$NAME_USERID_FIELD`          | `uid`                | `uid`, `uidNumber`, `sAMAccountName`               | The attribute of the user account which should be used as an id for the user.                                 |
| `HD_AUTH_LDAP_$NAME_DISPLAY_NAME_FIELD`    | `displayName`        | `displayName`, `name`, `cn`                        | The attribute of the user account which should be used as the display name for the user.                      |
| `HD_AUTH_LDAP_$NAME_PROFILE_PICTURE_FIELD` | `jpegPhoto`          | `jpegPhoto`, `thumbnailPhoto`                      | The attribute of the user account which should be used as the user image for the user.                        |
| `HD_AUTH_LDAP_$NAME_BIND_DN`               | -                    | `cn=admin,dc=LDAP,dc=example,dc=com`               | The dn which is used to perform the user search. If this is omitted then HedgeDoc will use an anonymous bind. |
| `HD_AUTH_LDAP_$NAME_BIND_CREDENTIALS`      | -                    | `MyLdapPassword`                                   | The credential to access the LDAP server.                                                                     |
| `HD_AUTH_LDAP_$NAME_TLS_CERT_PATHS`        | -                    | `LDAP-ca.pem`                                      | A comma-seperated list of paths to TLS certificates for the LDAP server.                                      |

**ToDo:** Add other authentication methods.

## Customization

HedgeDoc allows you to set a name or logo for your organization.
How this looks and where this is used, can be seen below.
You can also provide a privacy policy, terms of use or an imprint url
for your HedgeDoc instance.

| environment variable  | default | example                           | description                                                                                                                                                             |
| --------------------- | ------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HD_CUSTOM_NAME`      | -       | `DEMO Corp`                       | The text will be shown in the top right corner in the editor and on the intro page. If you also configure a custom logo, this will be used as the alt text of the logo. |
| `HD_CUSTOM_LOGO`      | -       | `https://md.example.com/logo.png` | The logo will be shown in the top right corner in the editor and on the intro page.                                                                                     |
| `HD_PRIVACY_URL`      | -       | `https://md.example.com/privacy`  | The URL that should be linked as the privacy notice in the footer.                                                                                                      |
| `HD_TERMS_OF_USE_URL` | -       | `https://md.example.com/terms`    | The URL that should be linked as the terms of user in the footer.                                                                                                       |
| `HD_IMPRINT_URL`      | -       | `https://md.example.com/imprint`  | The URL that should be linked as the imprint in the footer.                                                                                                             |

### Example

#### Links

![Links on the Frontpage][links-frontpage]
*links for the privacy policy, terms of use and imprint on the front page*

#### Logo

For this demo we use this image:  
![The demo logo][demo-logo]

![The demo logo on the Frontpage][logo-front-page]  
*logo used on the front page*

![The demo logo in the editor (light)][logo-editor-light]
![The demo logo in the editor (dark)][logo-editor-dark]  
*logo used in the editor*

#### Name

For this demo we use the name `DEMO Corp`

![The name on the Frontpage][name-front-page]  
*name used on the front page*

![The name in the editor (light)][name-editor-light]
![The name in the editor (dark)][name-editor-dark]
*name used in the editor*

## Database

We officially support and test these databases:

- SQLite (for development and smaller instances)
- PostgreSQL
- MariaDB

| environment variable | default | example          | description                                                                                |
| -------------------- | ------- | ---------------- | ------------------------------------------------------------------------------------------ |
| `HD_DATABASE_TYPE`   | -       | `postgres`       | The database type you want to use. This can be `postgres`, `mysql`, `mariadb` or `sqlite`. |
| `HD_DATABASE_NAME`   | -       | `HedgeDoc`       | The name of the database to use. When using SQLite, this is the path to the database file. |
| `HD_DATABASE_HOST`   | -       | `db.example.com` | The host, where the database runs. *Only if you're **not** using `sqlite`.*                |
| `HD_DATABASE_PORT`   | -       | `5432`           | The port, where the database runs. *Only if you're **not** using `sqlite`.*                |
| `HD_DATABASE_USER`   | -       | `HedgeDoc`       | The user that logs in the database. *Only if you're **not** using `sqlite`.*               |
| `HD_DATABASE_PASS`   | -       | `password`       | The password to log into the database. *Only if you're **not** using `sqlite`.*            |

## External services

| environment variable | default | example                             | description                                                                                                                         |
| -------------------- | ------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `HD_PLANTUML_SERVER` | -       | `https://www.plantuml.com/plantuml` | The PlantUML server that HedgeDoc uses to render PlantUML diagrams. If this is not configured, PlantUML diagrams won't be rendered. |
| `HD_IMAGE_PROXY`     | -       | `https://image-proxy.example.com`   | **ToDo:** Add description                                                                                                           |

## Media

There are a couple of different backends that can be used to host your images for HedgeDoc.

- [Azure](media/azure.md)
- [Local filesystem](media/filesystem.md)
- [Imgur](media/imgur.md)
- [S3-compatible](media/s3.md)
- [WebDAV](media/webdav.md)

[zxcvbn-ts-score]: https://zxcvbn-ts.github.io/zxcvbn/guide/getting-started/#output
[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting
[links-frontpage]: ../images/customization/links.png
[demo-logo]: ../images/customization/demo_logo.png
[logo-front-page]: ../images/customization/logo/frontpage.png
[logo-editor-light]: ../images/customization/logo/editor_light.png
[logo-editor-dark]: ../images/customization/logo/editor_dark.png
[name-front-page]: ../images/customization/name/frontpage.png
[name-editor-light]: ../images/customization/name/editor_light.png
[name-editor-dark]: ../images/customization/name/editor_dark.png
