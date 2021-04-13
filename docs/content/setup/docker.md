# HedgeDoc Docker Image

!!! info "Requirements on your server"
    - [Git](https://git-scm.com/)
    - [Docker](https://docs.docker.com/get-docker/) 17.03.1 or higher
    - [Docker Compose](https://docs.docker.com/compose/install/)

The official docker images are [available on quay.io](https://quay.io/repository/hedgedoc/hedgedoc).
We currently only support the `amd64` architecture.


The easiest way to get started with HedgeDoc and Docker is to use the following `docker-compose.yml`:

!!! warning
    This is a minimal example to get started quickly and not intended for production use.

```yaml
version: '3'
services:
  database:
    image: postgres:9.6-alpine
    environment:
      - POSTGRES_USER=hedgedoc
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=hedgedoc
    volumes:
      - database:/var/lib/postgresql/data
    restart: always
  app:
    # Make sure to use the latest release from https://hedgedoc.org/latest-release
    image: quay.io/hedgedoc/hedgedoc:1.7.2
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
After executing `docker-compose up`, HedgeDoc should be available at [http://127.0.0.1:3000](http://127.0.0.1:3000).  
You can now continue to configure your container with environment variables.
Check out [the configuration docs](/configuration) for more details.

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

### Migrating from HackMD

If you used the [`docker-hackmd`](https://github.com/hackmdio/docker-hackmd) repository before,
you can migrate to [`hedgedoc-container`](https://github.com/hedgedoc/container).

`hedgedoc-container` is a fork of `docker-hackmd`, so you need to replace the upstream URL:

```shell
git remote set-url origin https://github.com/hedgedoc/container.git
git pull
```

Since both codebases diverged since the fork, we recommend that you read the
[HedgeDoc release notes](https://hedgedoc.org/releases/) at
least since 1.6.0 and follow any instructions present there. A particular issue
that has come up is when handling TLS connections when using a reverse proxy.
You must [set the `X-Forwarded-Proto` header
correctly](https://docs.hedgedoc.org/guides/reverse-proxy/).


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

## Custom build

The default setting is to use pre-built docker images.  
If you want to build your own containers uncomment the `build` section in the
[`docker-compose.yml`](https://github.com/hedgedoc/container/blob/master/docker-compose.yml)
and edit the
[`config.json`](https://github.com/hedgedoc/container/blob/master/resources/config.json).

If you change the database settings and don't use the `CMD_DB_URL` make sure
you edit the
[`.sequelizerc`](https://github.com/hedgedoc/container/blob/master/resources/.sequelizerc).

## Issues

If you have any problems with or questions about this image, please contact us
through a [GitHub issue](https://github.com/hedgedoc/container/issues).

You can also reach many of the project maintainers via our matrix room
[`#hedgedoc:matrix.org`](https://chat.hedgedoc.org).
