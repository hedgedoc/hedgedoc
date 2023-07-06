# Setup

HedgeDoc 2 currently supports deployment using [Docker Compose][docker-compose].

The `docker` folder in the root of our repo contains all files required to get started, deploying
HedgeDoc 2, a PostgreSQL database and a Caddy reverse proxy.

## Development or local testing

To run HedgeDoc 2 locally, you do not need to change anything.
Caddy will automatically generate a TLS certificate for `hedgedoc2.localhost` using its internal CA.
After running `docker compose up`, visit <https://hedgedoc2.localhost>.
You will have to accept the TLS warning in your browser the first time the page is opened.

## Production setup

!!! danger "HedgeDoc 2 is not yet production ready!"
    This section explains how a production deployment of HedgeDoc 2 on a publicly accessible domain
    might look in the future.  
     HedgeDoc 2 itself is not production ready yet, so only use these instructions to set up an
    instance for testing with your friends.

For a production setup, first set a unique session secret with
`sed -i "s/change_me_in_production/$(pwgen -s 64)/" .env`.

Then open the `.env` file and edit `HD_BASE_URL`. It needs to contain the full URL of your instance,
like it will be entered in the browser. If you enter a URL starting with `https://`, Caddy will
automatically gather certificates via *Let's Encrypt*
(or its internal CA in case of `.localhost` domains).
Make sure your host is accessible under the domain from `HD_BASE_URL`, otherwise Let's Encrypt
validation will fail.

Optionally, you can also change

- `HD_MEDIA_BACKEND`: If you do not want HedgeDoc to handle media uploads itself, configure
  another backend here. For more information, [see the media backend docs](/config/#media).
- `HD_AUTH_*`: If you do not want to use the integrated auth system,
  you can [consult the authentication docs](/config/#authentication) for details.

[docker-compose]: https://docs.docker.com/compose/install/
