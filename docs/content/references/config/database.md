# Database

We officially support and test these databases:

- SQLite (for development and smaller instances)
- PostgreSQL
- MariaDB

!!! warning  
    We don't necessarily support MySQL.

<!-- markdownlint-disable proper-names -->
| environment variable   | default | example             | description                                                                                |
|------------------------|---------|---------------------|--------------------------------------------------------------------------------------------|
| `HD_DATABASE_TYPE`     | -       | `postgres`          | The database type you want to use. This can be `postgres`, `mariadb` or `sqlite`.          |
| `HD_DATABASE_NAME`     | -       | `hedgedoc`          | The name of the database to use. When using SQLite, this is the path to the database file. |
| `HD_DATABASE_HOST`     | -       | `db.example.com`    | The host, where the database runs. *Only if you're **not** using `sqlite`.*                |
| `HD_DATABASE_PORT`     | -       | `5432`              | The port, where the database runs. *Only if you're **not** using `sqlite`.*                |
| `HD_DATABASE_USERNAME` | -       | `hedgedoc`          | The user that logs in the database. *Only if you're **not** using `sqlite`.*               |
| `HD_DATABASE_PASSWORD` | -       | `password`          | The password to log into the database. *Only if you're **not** using `sqlite`.*            |
<!-- markdownlint-enable proper-names -->

## TLS

To secure the connection between HedgeDoc and your database server, you can enable TLS.
This is only available for PostgreSQL and MariaDB, not for SQLite.

<!-- markdownlint-disable proper-names -->
| environment variable                  | default | example               | description                                                                                                                                    |
|---------------------------------------|---------|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `HD_DATABASE_TLS_ENABLED`             | `false` | `true`                | Set to `true` to enable TLS for the database connection.                                                                                       |
| `HD_DATABASE_TLS_CA_PATH`             | -       | `/path/to/ca.pem`     | The file path of the CA certificate used as trust anchor for verifying the database server's certificate.                                      |
| `HD_DATABASE_TLS_CERT_PATH`           | -       | `/path/to/cert.pem`   | The file path of the client certificate for mutual TLS authentication.                                                                         |
| `HD_DATABASE_TLS_KEY_PATH`            | -       | `/path/to/key.pem`    | The file path of the client private key for mutual TLS authentication.                                                                         |
| `HD_DATABASE_TLS_REJECT_UNAUTHORIZED` | `true`  | `false`               | Whether to verify the database server's certificate against the CA. Set to `false` to allow self-signed certificates (not recommended).         |
| `HD_DATABASE_TLS_CIPHERS`             | -       | `TLS_AES_256_GCM_SHA384` | The TLS cipher suites to use instead of the Node.js defaults.                                                                               |
| `HD_DATABASE_TLS_MIN_VERSION`         | -       | `TLSv1.2`            | The minimum TLS version to allow. Must be `TLSv1.2` or `TLSv1.3`.                                                                             |
| `HD_DATABASE_TLS_MAX_VERSION`         | -       | `TLSv1.3`            | The maximum TLS version to allow. Must be `TLSv1.2` or `TLSv1.3`.                                                                             |
| `HD_DATABASE_TLS_PASSPHRASE`          | -       | `my-passphrase`       | The passphrase for the client private key. *Only used for PostgreSQL.*                                                                         |
<!-- markdownlint-enable proper-names -->

!!! note
    The certificate file paths point to PEM-encoded files on the filesystem. Their contents
    are read at application startup. Make sure the files are accessible to the HedgeDoc process.

!!! note
    `HD_DATABASE_TLS_PASSPHRASE`, `HD_DATABASE_TLS_MIN_VERSION`, and `HD_DATABASE_TLS_MAX_VERSION`
    are only supported for PostgreSQL connections. MariaDB connections only support
    `HD_DATABASE_TLS_CA_PATH`, `HD_DATABASE_TLS_CERT_PATH`, `HD_DATABASE_TLS_KEY_PATH`,
    `HD_DATABASE_TLS_REJECT_UNAUTHORIZED`, and `HD_DATABASE_TLS_CIPHERS`.
