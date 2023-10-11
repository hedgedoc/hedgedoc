# Setup

After completing this tutorial you'll have your own HedgeDoc instance running.
We will use [Docker][docker-docs] to accomplish this.

!!! warning "HedgeDoc 2 is currently in alpha"
    Alpha releases come with no guarantees regarding upgradeability.
    It is very likely that you will need to wipe the database between alpha releases.  
    Please set up a separate instance to test HedgeDoc 2, there is currently no migration path
    from HedgeDoc 1.

<!-- markdownlint-disable proper-names -->

1. Open the terminal of the machine you want to install HedgeDoc on.

2. Check if you have Docker installed by running `docker --version`. 
   The response should contain some version number greater than `20.10.13`.
    - If not please refer to [the Docker install guide][docker-install] to install Docker.

3. Create a new directory for your HedgeDoc instance: `mkdir -p /opt/hedgedoc`.

4. Change into the directory with `cd /opt/hedgedoc`.

5. Download these files:
   - `curl -o .env https://docs.hedgedoc.dev/files/setup-docker/config.env`
   - `curl -o Caddyfile https://docs.hedgedoc.dev/files/setup-docker/Caddyfile`
   - `curl -o docker-compose.yml https://docs.hedgedoc.dev/files/setup-docker/docker-compose.yml`

6. Open the file `.env` in the editor of your choice (for example with `nano`) and edit the
   following variables:
   - `HD_BASE_URL`: This should contain the full url you intend to run HedgeDoc on (e.g. for the
     demo this would be `https://demo.hedgedoc.org`). If you just want to run HedgeDoc on your
     local machine for now `https://hedgedoc.localhost` should be sufficient for testing.
   - `HD_SESSION_SECRET`: This should contain a long and random secret for your login sessions.
     You can generate it with `pwgen -s 64` or any other way you see fit.
   - `HD_DATABASE_PASS`: This should contain a strong password than `password` for your database.
     You can again use `pwgen -s 64` to generate it.

7. Start the Docker containers by running `docker compose up -d`.

8. Navigate your browser to the url you chose in step 6. Your instance is now ready to use.

<!-- markdownlint-disable no-space-in-code -->

!!! info Using a different port
    This tutorial assumes that you run your HedgeDoc 2 instance on port 80 and 443 (HTTP and HTTPS).
    If you want to use a custom port, be sure to update your `.env` file to include the port in the
    `HD_BASE_URL` variable as well as update the port bindings in the `docker-compose.yml` file.  
    For example, when using the base URL `http://localhost:8080`, only use the following ports
    section for the `proxy` service:
    ```yaml
    ports:
      - "8080:8080"
    ```

<!-- markdownlint-enable no-space-in-code -->
<!-- markdownlint-enable proper-names -->

You can now play around with your HedgeDoc instance and read about next steps
as either [a new user](#for-users) or [an admin](#for-admins).

## Next Steps

### For Users

- [Creating a user account][tutorials/user]
- [Creating your first note][tutorials/first-note]
- [Creating your first presentation][tutorials/first-presentation]

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
port `80` or `443`. The easiest fix for this is to stop the other application.
If you want to run multiple applications on that port on your server you may want to read our guide
about [reverse proxying][reverse-proxying].

[docker-docs]: https://docs.docker.com/
[docker-install]: https://docs.docker.com/engine/install/

[tutorials/user]: user.md
[tutorials/first-note]: first-note.md
[tutorials/first-presentation]: first-presentation.md

[reverse-proxying]: ../how-to/reverse-proxy.md
[backups]: ../how-to/backup.md
[auth-methods]: ../how-to/auth.md

[config]: ../references/config/index.md
