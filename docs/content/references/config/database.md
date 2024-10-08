# Database

We officially support and test these databases:

- SQLite (for development and smaller instances)
- PostgreSQL
- MariaDB

<!-- markdownlint-disable proper-names -->

| environment variable | default | example          | description                                                                                |
| -------------------- | ------- | ---------------- | ------------------------------------------------------------------------------------------ |
| `HD_DATABASE_TYPE`   | -       | `postgres`       | The database type you want to use. This can be `postgres`, `mysql`, `mariadb` or `sqlite`. |
| `HD_DATABASE_NAME`   | -       | `hedgedoc`       | The name of the database to use. When using SQLite, this is the path to the database file. |
| `HD_DATABASE_HOST`   | -       | `db.example.com` | The host, where the database runs. _Only if you're **not** using `sqlite`._                |
| `HD_DATABASE_PORT`   | -       | `5432`           | The port, where the database runs. _Only if you're **not** using `sqlite`._                |
| `HD_DATABASE_USER`   | -       | `hedgedoc`       | The user that logs in the database. _Only if you're **not** using `sqlite`._               |
| `HD_DATABASE_PASS`   | -       | `password`       | The password to log into the database. _Only if you're **not** using `sqlite`._            |
| `HD_DATABASE_SSL`    | '0'     | `1`              | Pass this value when SSL/TLS configuration is needed                                       |

### SSL/TLS configuration for database

**Note:** `HD_DATABASE_SSL='1'` should be added in .env else following SSL/TLS config will not work

<!-- markdownlint-disable proper-names -->

| environment variable                  | default | example          | description                                                                                                                                                                                 |
| ------------------------------------- | ------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HD_DATABASE_SSL_CA_PATH`             | -       | ./mysql-ca.crt   | The path of SSL/TLS certificate authority (CA) certificate needed for establishing secure database connections                                                                              |
| `HD_DATABASE_SSL_CERT_PATH`           | -       | ./mysql-cert.crt | The path for client certificate to use in the SSL handshake.                                                                                                                                |
| `HD_DATABASE_SSL_REJECT_UNAUTHORIZED` | 'true'  | 'false'          | If true server certificate will be verified against the list of supplied CAs.                                                                                                               |
| `HD_DATABASE_SSL_KEY_PATH`            | -       | ./key.pem        | This is passed as the key option to [SSL key option](https://github.com/mysqljs/mysql?tab=readme-ov-file#ssl-options)                                                                       |
| `HD_DATABASE_SSL_CIPHERS`             | -       | 'TLS_AES_256...' | The ciphers to use to use in the SSL handshake instead of the default ones for Node.js.                                                                                                     |
| `HD_DATABASE_SSL_MAX_VERSION`         | -       | 'TLSv1.3'        | This is passed as the maxVersion option for [SSL max_version](https://github.com/mysqljs/mysql?tab=readme-ov-file#ssl-options)                                                              |
| `HD_DATABASE_SSL_MIN_VERSION`         | -       | 'TLSv1.3'        | This is passed as the minVersion option for [SSL max_version](https://github.com/mysqljs/mysql?tab=readme-ov-file#ssl-options)                                                              |
| `HD_DATABASE_SSL_PASSPHRASE`          | -       | 'XSX@W...'       | Shared passphrase used for a single private key and/or a PFX.This is passed as the passphrase option for [SSL max_version](https://github.com/mysqljs/mysql?tab=readme-ov-file#ssl-options) |

This CA certificate serves as the anchor for verifying the validity of the certificate chain. Ensure that the provided CA certificate is trusted by the database server to establish secure connections.

Check full description for [mysql TLS](https://github.com/mysqljs/mysql?tab=readme-ov-file#ssl-options)

<!-- markdownlint-enable proper-names -->
