# Install HedgeDoc

After completing this tutorial you'll have your own HedgeDoc instance running.
We will use [Docker][docker-docs] to accomplish this.

!!! warning "HedgeDoc 2 is currently in alpha"
    Alpha releases come with no guarantees regarding upgradeability.
    It is very likely that you will need to wipe the database between alpha releases.  
    Please set up a separate instance to test HedgeDoc 2, there is currently no migration path
    from HedgeDoc 1.

<!-- markdownlint-disable proper-names -->
<!-- markdownlint-disable line-length -->

1. Open the terminal of the machine you want to install HedgeDoc on.

2. Check if you have Docker installed by running `docker --version`. 
   The response should contain some version number greater than `20.10.13`.
   If you don't have Docker installed or if the version is too old, please refer to
   [the Docker install guide][docker-install] to install Docker.

3. Create a new directory for your HedgeDoc instance: `mkdir -p /opt/hedgedoc`.

4. Change into the directory with `cd /opt/hedgedoc`.

5. Download these files:
   - `curl -o .env https://raw.githubusercontent.com/hedgedoc/hedgedoc/refs/heads/develop/docker/.env`
   - `curl -o Caddyfile https://raw.githubusercontent.com/hedgedoc/hedgedoc/refs/heads/develop/docker/Caddyfile`
   - `curl -o docker-compose.yml https://raw.githubusercontent.com/hedgedoc/hedgedoc/refs/heads/develop/docker/docker-compose.yml`
     <!-- TODO: Create short links for these URLs, for example at source.hedgedoc.org/docker/Caddyfile etc. -->

6. Open the file `.env` in the editor of your choice (for example with `nano`) and edit the
   following variables:
   - `HD_BASE_URL`: This should contain the full url you intend to run HedgeDoc on (e.g. for the
     demo this would be `https://demo.hedgedoc.org`). If you just want to run HedgeDoc on your
     local machine for now `https://hedgedoc.localhost` should be sufficient for testing.
   - `HD_SESSION_SECRET`: This should contain a long and random secret for your login sessions.
     You can generate it with `pwgen -s 64 1` or any other way you see fit.
     If you don't have `pwgen` installed you can also use this command which should work
     out of the box: `tr -dc A-Za-z0-9 < /dev/urandom | head -c 64`
   - `HD_DATABASE_PASS`: This should contain a stronger password than `password` for your database.
     You can again use `pwgen -s 64 1` or a similar command to generate it.

7. Start the Docker containers by running `docker compose up -d`. This command will start four docker
   containers: The HedgeDoc frontend, the HedgeDoc backend, a PostgreSQL database and the Caddy reverse-proxy.

8. Navigate your browser to the url you chose in step 6. Your instance is now ready to use.

<!-- markdownlint-disable no-space-in-code -->

!!! info Using a different port
    This tutorial assumes that you run your HedgeDoc 2 instance on port 80 and 443 (HTTP and HTTPS).
    If you want to use a custom port, be sure to update your `.env` file to include the port in the
    `HD_BASE_URL` variable as well as update the port bindings in the `docker-compose.yml` file.  
    For example, when using the base URL `http://192.168.1.100:8080`, only use the following ports
    section for the `proxy` service:
    ```yaml
    ports:
      - "8080:8080"
    ```

<!-- markdownlint-enable no-space-in-code -->
<!-- markdownlint-enable line-length -->
<!-- markdownlint-enable proper-names -->

You can now play around with your HedgeDoc instance and read about next steps
as either [a new user](#for-users) or [an admin](#for-admins).

## Next Steps

### For Users

- [Creating a user account][getting-started/user]
- [Creating your first note][getting-started/first-note]
- [Explore notes][getting-started/explore]
- [Creating your first presentation][getting-started/first-presentation]

### For admins

- [How to use a reverse proxy][reverse-proxying]
- [How to back up HedgeDoc][backups]
- [How to use other authentication methods][auth-methods]
- [Advanced configuration options][config]

## Troubleshooting

### Port already used

```text
Error response from daemon: driver failed programming external connectivity: Bind for 0.0.0.0:80
failed: port is already allocated.
```

If you see this error, it means there is already something running on your machine that uses
port `80` or `443`. The easiest fix for this is to stop the other application. You can use the
command `ss -tulpn` to see which application utilizes which port.
If you want to run multiple applications on that port on your server you may want to read our guide
about [reverse proxying][reverse-proxying].

### Instance unreachable

You followed the guide to set up your instance, but when trying to access it in the browser, you
receive an error like `ERR_CONNECTION_REFUSED`.

First, check that the Docker containers are running. For this you can use the command
`docker compose ps -a`. If some of them are not running, check the logs and look out for error
messages. You can use `docker compose logs` for this.

In case the containers are running but you still can't reach HedgeDoc in the browser, verify that
the content of the variable `HD_BASE_URL` in the `.env` file matches exactly the URL you are trying
to open. Verify that the ports (`80` or `443` or a custom one) are correctly mapped in the
`docker-compose.yml`.

### Connection insecure

When accessing the HedgeDoc instance in your browser, you receive a warning that the HTTPS
certificate is not trustworthy. This is the case, if you use a URL ending in `.localhost`.
Caddy creates a temporary HTTPS certificate which is not signed by any public CA. You can
safely ignore and bypass this error. See [the Caddy docs on HTTPS][caddy-https] for more
information.

[docker-docs]: https://docs.docker.com/
[docker-install]: https://docs.docker.com/engine/install/

[getting-started/user]: user.md
[getting-started/first-note]: first-note.md
[getting-started/first-presentation]: first-presentation.md
[getting-started/explore]: explore.md

[reverse-proxying]: ../guides/reverse-proxy.md
[backups]: ../guides/backup.md
[auth-methods]: ../guides/auth.md

[config]: ../config/index.md
[caddy-https]: https://caddyserver.com/docs/automatic-https
