## What you need

This guide will provide you with a batteries included configuration using [docker compose][docker-compose-docs] and [caddy][caddy].
In the following it is assumed that you have a basic understanding of [docker compose][docker-compose-docs].  
We'll need three files: 

- [`docker-compose.yml`][docker-compose-file]
- [`config.env`][config.env]
- [`Caddyfile`][Caddyfile]

and `Caddyfile` contains the configuration for the reverse proxy [Caddy][caddy].

In the following you will find all of these files with some explanations and links to other parts of this documentation for further reading:

### docker-compose.yml

[download file][docker-compose-file]

```yaml
---
services:
  backend:
    image: ghcr.io/hedgedoc/hedgedoc/backend:2023.1.0-alpha
    volumes:
      - $PWD/.env:/usr/src/app/backend/.env
      - hedgedoc_uploads:/usr/src/app/backend/uploads

  frontend:
    image: ghcr.io/hedgedoc/hedgedoc/frontend:2023.1.0-alpha
    environment:
      HD_BASE_URL: "${HD_BASE_URL}"

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: "${HD_DATABASE_USER}"
      POSTGRES_PASSWORD: "${HD_DATABASE_PASS}"
      POSTGRES_DB: "${HD_DATABASE_NAME}"
  
  proxy:
    image: caddy:latest
    restart: unless-stopped
    environment:
      HD_BASE_URL: "${HD_BASE_URL}"
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - $PWD/Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data

volumes:
  hedgedoc_uploads:
```

This file instructs docker how to start the different components needes to run HedgeDoc including frontend, backend, postgres database and the reverse proxy [caddy][caddy]. The images, that will be uploaded to HedgeDoc, are stored in the docker volume `hedgedoc_uploads` and mounted to the backend container. Additionally the files `.env` and `Caddyfile`, which should be placed next to `docker-compose.yml`, will be mounted inside the backend container for `.env` and inside the caddy container for `Caddyfile`.

### config.env

[download file][config.env]

```
# General settings
HD_BASE_URL="https://md.example.com"
HD_SESSION_SECRET="change_me_in_production"

# Database settings
HD_DATABASE_TYPE="postgres"
HD_DATABASE_HOST="db"
HD_DATABASE_PORT="5432"
HD_DATABASE_NAME="hedgedoc"
HD_DATABASE_USER="hedgedoc"
HD_DATABASE_PASS="password"

# Uploads
HD_MEDIA_BACKEND="filesystem"
HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH="uploads/"

# Auth
HD_AUTH_LOCAL_ENABLE_LOGIN="true"
HD_AUTH_LOCAL_ENABLE_REGISTER="true"
```
This file contains your HedgeDoc 2 config

This configuration specifies:   

- to use a postgres database  
- to use the local file system (actually the docker volume `hedgedoc_uploads`) as your media backend    
- allowing registration of new local users
- allowing local users to login  

You are able to configure other databases, media backends and login provider than those chosen in this example. All available configurations can be found in the [configuration documentation][config-docs].

!!! info
      We encourage all admins to make themselves familiar with the different possibilities to configure HedgeDoc to make sure you run HedgeDoc in the best way possible for your usage scenario.

### Caddyfile

[download file][Caddyfile]

```
{$HD_BASE_URL}

log {
	output stdout
	level WARN
	format console
}

reverse_proxy /realtime http://backend:3000
reverse_proxy /api/* http://backend:3000
reverse_proxy /public/* http://backend:3000
reverse_proxy /uploads/* http://backend:3000
reverse_proxy /apidoc/* http://backend:3000
reverse_proxy /* http://frontend:3001
```

This Caddyfile will make it possible to access HedgeDocs frontend and backend from on unified url specified in the variable `HD_BASE_URL`, proxying different parts of the application to the relevant containers. You don't need to change anything to this file as `HD_BASE_URL` is loaded from the `config.env` file.

## Running HedgeDoc

Now that you have some idea about these files, let's get started running HedgeDoc:

1. Download the three files [docker-compose.yml][docker-compose-file], [Caddyfile][Caddyfile] & [config.env][config.env].
2. Place the files in a directory on your machine e.g `/opt/hedgedoc`.
3. Make the necessary changes to `config.env`:

    - Rename the file to `.env` (Notice the `.` at the beginning)
    - `HD_BASE_URL`: This contains the full url you intend to run HedgeDoc on e.g for the demo this would be `https://demo.hedgedoc.org`. If you just want to run HedgeDoc on your local machine for now `https://hedgedoc.localhost` should be sufficient for testing.
    - `HD_SESSION_SECRET`: This contains a long and random secret for your login sessions. You can generate it with `pwgen -s 64` or any other way you see fit.
    - `HD_DATABASE_PASS`: This should contain a stronger password than `password` for your database.

4. Inside this directory run `docker-compose up` to start the docker composition.
5. Navigate your browser to the url you chose in step 3.

[docker-compose-docs]: https://docs.docker.com/compose
[config-docs]: /config
[caddy]: https://caddyserver.com/
[docker-compose-file]: /setup/docker/docker-compose.yml
[config.env]: /setup/docker/config.env
[Caddyfile]: /setup/docker/Caddyfile