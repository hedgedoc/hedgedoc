# Database

We officially support and test these databases:

- SQLite (for development and smaller instances)
- PostgreSQL
- MariaDB

!!! warning  
    We don't necessarily support MySQL.

<!-- markdownlint-disable proper-names -->
| environment variable   | default | example             | description                                                                            |
|------------------------|---------|---------------------|----------------------------------------------------------------------------------------|
| `HD_DATABASE_TYPE`     | -       | `postgres`          | The database type you want to use. This can be `postgres`, `mariadb` or `sqlite`. |
| `HD_DATABASE_NAME`     | -       | `hedgedoc`          | The name of the database to use. When using SQLite, this is the path to the database file. |
| `HD_DATABASE_HOST`     | -       | `db.example.com`    | The host, where the database runs. *Only if you're **not** using `sqlite`.*            |
| `HD_DATABASE_PORT`     | -       | `5432`              | The port, where the database runs. *Only if you're **not** using `sqlite`.*            |
| `HD_DATABASE_USERNAME` | -       | `hedgedoc`          | The user that logs in the database. *Only if you're **not** using `sqlite`.*           |
| `HD_DATABASE_PASSWORD` | -       | `password`          | The password to log into the database. *Only if you're **not** using `sqlite`.*        |
<!-- markdownlint-enable proper-names -->
