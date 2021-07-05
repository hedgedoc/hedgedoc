HedgeDoc can be configured via environment variables either directly or via an `.env` file.

## The `.env` file

The `.env` file should be places in the root of the project and contains key value pairs of environment variables, and the values you configured them with. This can for example look like this:

```ini
HD_DOMAIN="http://localhost"
HD_MEDIA_BACKEND="filesystem"
HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH="uploads/"
HD_DATABASE_DIALECT="sqlite"
HD_DATABASE_STORAGE="./hedgedoc.sqlite"
```

We also provide an `.env.example` file containing a minimal configuration in the root of the project. This should help you to write your own configuration.

!!! warning  
    The minimal configuration provided in `.env.example` is exactly that: minimal. It will let you start HedgeDoc, but it is **not** meant to be used in production without prior changes.

## General

| environment variable     | default   | example                    | description                                                                                       |
|--------------------------|-----------|----------------------------|---------------------------------------------------------------------------------------------------|
| `HD_DOMAIN`              | -         | https://md.example.com     | The URL the HedgeDoc instance runs on.                                                            |
| `PORT`                   | 3000      |                            | The port the HedgeDoc instance runs on.                                                           |
| `HD_RENDERER_ORIGIN`     | HD_DOMAIN |                            | The URL the renderer runs on. If omitted this will be same as `HD_DOMAIN`.                        |
| `HD_LOGLEVEL`            | warn      |                            | The loglevel that should be used. Options are `error`, `warn`, `info`, `debug` or `trace`.        |
| `HD_FORBIDDEN_NOTE_IDS`  | -         | notAllowed, alsoNotAllowed | A list of note ids (separated by `,`), that are not allowed to be created or requested by anyone. |
| `HD_MAX_DOCUMENT_LENGTH` | 100000    |                            | The maximum length of any one document. Changes to this will impact performance for your users.   |

## Authentication

**ToDo:** Add Authentication docs

## Customization

| environment variable  | default | example                         | description                                                                                                                                                                |
|-----------------------|---------|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `HD_CUSTOM_NAME`      | -       | DEMO Corp                       | The text will be shown in the top right corner in the editor and on the intro page. If you also configured a custom logo this will be used as the alt text of the logo.    |
| `HD_CUSTOM_LOGO`      | -       | https://md.example.com/logo.png | The logo will be shown in the top right corner in the editor and on the intro page.                                                                                        |
| `HD_PRIVACY_URL`      | -       | https://md.example.com/privacy  | The URL that should be linked as the privacy notice in the footer.                                                                                                         |
| `HD_TERMS_OF_USE_URL` | -       | https://md.example.com/terms    | The URL that should be linked as the terms of user in the footer.                                                                                                          |
| `HD_IMPRINT_URL`      | -       | https://md.example.com/imprint  | The URL that should be linked as the imprint in the footer.                                                                                                                |

**ToDo:** Add screenshots to illustrate custom name and custom logo.

## Database

We officially support and test these databases:
- SQLite (for development and smaller instances)
- PostgreSQL
- MariaDB

| environment variable   | default | example           | description                                                                                   |
|------------------------|---------|-------------------|-----------------------------------------------------------------------------------------------|
| `HD_DATABASE_DIALECT`  | -       | postgres          | The database dialect you want to use. This can be `postgres`, `mysql`, `mariadb` or `sqlite`. |
| `HD_DATABASE_HOST`     | -       | db.example.com    | The host, where the database runs. *Only if you're **not** using `sqlite`.*                   |
| `HD_DATABASE_PORT`     | -       | 5432              | The port, where the database runs. *Only if you're **not** using `sqlite`.*                   |
| `HD_DATABASE_NAME`     | -       | hedgedoc          | The name of the database to use. *Only if you're **not** using `sqlite`.*                     |
| `HD_DATABASE_USER`     | -       | hedgedoc          | The user that logs in the database. *Only if you're**not** using `sqlite`.*                   |
| `HD_DATABASE_PASS`     | -       | password          | The password to log into the database. *Only if you're **not** using `sqlite`.*               |
| `HD_DATABASE_STORAGE`  | -       | ./hedgedoc.sqlite | The location of the database file. *Only if you're using `sqlite`.*                           |

## External services

| environment variable   | default | example                           | description                                                                                                                          |
|------------------------|---------|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `HD_PLANTUML_SERVER`   | -       | https://www.plantuml.com/plantuml | The PlantUML server that HedgeDoc uses to render PlantUML diagrams. If this is not configured, PlantUML diagrams won't be rendered.  |
| `HD_IMAGE_PROXY`       | -       | https://image-proxy.example.com   | **ToDo:** Add description                                                                                                            |

## Media

There are couple of different backends that can be used to host your images for HedgeDoc.

- [Azure](media/azure.md)
- [local filesystem](media/filesystem.md)
- [imgur](media/imgur.md)
- [S3-compatible](media/s3.md)
- [WebDAV](media/webdav.md)
