# HedgeDoc Docker Image

!!! info "Requirements on your server"
    - [Git](https://git-scm.com/)
    - [Docker](https://docs.docker.com/get-docker/) 17.03.1 or higher
    - [Docker Compose](https://docs.docker.com/compose/install/)

The official docker images are [available on quay.io](https://quay.io/repository/hedgedoc/hedgedoc).
We currently support the `amd64` and `arm64` architectures.


The easiest way to get started with HedgeDoc and Docker is to use the following `docker-compose.yml`:

!!! warning
    This is a minimal example to get started quickly and not intended for production use.

```yaml
version: '3'
services:
  database:
    image: postgres:13.4-alpine
    environment:
      - POSTGRES_USER=hedgedoc
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=hedgedoc
    volumes:
      - database:/var/lib/postgresql/data
    restart: always
  app:
    # Make sure to use the latest release from https://hedgedoc.org/latest-release
    image: quay.io/hedgedoc/hedgedoc:1.10.3
    environment:
      - CMD_DB_URL=postgres://hedgedoc:password@database:5432/hedgedoc
      - CMD_DOMAIN=localhost
      - CMD_URL_ADDPORT=true
    volumes:
      - uploads:/hedgedoc/public/uploads
    ports:
      - "3000:3000"
    restart: always
    depends_on:
      - database
volumes:
  database:
  uploads:
```
After executing `docker-compose up`, HedgeDoc should be available at [http://localhost:3000](http://localhost:3000).  
You can now continue to configure your container with environment variables.
Check out [the configuration docs](/configuration) for more details.

## File Permissions

By default, HedgeDoc will change the permissions of the uploads directory to
`0700` on every start of the Docker container. This is OK if you keep the files
in a named volume, but if you want to serve the files from a webserver on your
host (e.g. an Nginx reverse proxy) the webserver may not have the permission to
read the files.

To fix this, you can set the `UPLOADS_MODE` env variable to something other
than `0700`.

## Upgrading

!!! warning
    Before you upgrade, **always read the release notes**.  
    You can find them on our [releases page](https://hedgedoc.org/releases/).

!!! info "Upgrading to 1.7"
    Together with changing the name to "HedgeDoc" the default username,
    password and database name have been changed in `docker-compose.yml`.

    In order to migrate the existing database to the new default credentials, run
    ```shell
    docker-compose exec database createuser --superuser -Uhackmd postgres
    docker-compose exec database psql -Upostgres -c "alter role hackmd rename to hedgedoc; alter role hedgedoc with password 'password'; alter database hackmd rename to hedgedoc;"
    ```
    before running `docker-compose up`.

You can upgrade to the latest release by stopping the containers and changing the referenced image version in `docker-compose.yml`.  
Then run `docker-compose up` to start HedgeDoc again. 

### Migrating from CodiMD & HackMD

If you currently use CodiMD or HackMD, you should be able to swap the docker image for ours.
See [the general migration hints](/setup/getting-started/#migrating-from-codimd-hackmd) for compatibility details.


## Backup

If you use a PostgreSQL database, you can leverage this command to create a backup: 

```shell
 docker-compose exec database pg_dump hedgedoc -U hedgedoc > backup.sql
```


## Restore

If you want to restore your PostgreSQL backup, run these commands before starting the application for the first time:

```shell
docker-compose up -d database
cat backup.sql | docker exec -i $(docker-compose ps -q database) psql -U hedgedoc
```
