# OAuth with Authelia SSO (self-hosted)

## Prerequisites

This guide assumes you have run and configured [Authelia](https://www.authelia.com/). If you want to get Authelia running quickly, there are example docker-compose files in the [Authelia Github repository](https://github.com/authelia/authelia/tree/master/examples/compose).
Also this guides assumes you run HedgeDoc via a [Docker container](../../setup/docker.md). Find out how the mentioned config environment variables are mapped to entries in the config file at our [configuration page](../../configuration.md).

## Steps

1. Set up the necessary OpenID Connect parameters in your Authelia `configuration.yml` as explained in the documentation at <https://www.authelia.com/docs/configuration/identity-providers/oidc.html>.
2. Make sure to generate safe secrets (such as `LENGTH=64; tr -cd '[:alnum:]' < /dev/urandom | fold -w "${LENGTH}" | head -n 1 | tr -d '\n' ; echo`)
3. A completed `identity_providers` section of the configuration may look like the following (the chosen Client ID `id` shouldn't actually be this guessable for safety reasons):

```yaml
identity_providers:
  oidc:
    hmac_secret: <hmac secret here> # use docker secrets for this
    issuer_private_key: <issuer private key secret here> # use docker secrets for this
    access_token_lifespan: 1h
    authorize_code_lifespan: 1m
    id_token_lifespan: 1h
    refresh_token_lifespan: 90m
    enable_client_debug_messages: false
    clients:
      - id: HedgeDoc # this should be changed to something more secure
        description: HedgeDoc SSO
        secret: <client secret here>
        public: false
        authorization_policy: two_factor
        audience: []
        scopes:
          - openid
          - email
          - profile
        redirect_uris:
          - https://<your-hedgedoc-url>/auth/oauth2/callback
        grant_types:
          - refresh_token
          - authorization_code
        response_types:
          - code
        response_modes:
          - form_post
          - query
          - fragment
        userinfo_signing_algorithm: none
```

4. Restart Authelia to apply to new configuration and check for any errors in the log
5. In the `docker-compose.yml` of HedgeDoc add the following environment variables (you can choose different attributes for e.g. the display name - all available attributes you can find in the [scope definitions](https://www.authelia.com/docs/configuration/identity-providers/oidc.html#scope-definitions)):

```yaml
- CMD_URL_ADDPORT=false
- CMD_PROTOCOL_USESSL=true
- CMD_OAUTH2_PROVIDERNAME=Authelia
- CMD_OAUTH2_CLIENT_ID=HedgeDoc
- CMD_OAUTH2_CLIENT_SECRET=<client secret here>
- CMD_OAUTH2_SCOPE=openid email profile
- CMD_OAUTH2_USER_PROFILE_USERNAME_ATTR=sub
- CMD_OAUTH2_USER_PROFILE_DISPLAY_NAME_ATTR=name
- CMD_OAUTH2_USER_PROFILE_EMAIL_ATTR=email
- CMD_OAUTH2_USER_PROFILE_URL=https://<your-authelia-url>/api/oidc/userinfo
- CMD_OAUTH2_TOKEN_URL=https://<your-authelia-url>/api/oidc/token
- CMD_OAUTH2_AUTHORIZATION_URL=https://<your-authelia-url>/api/oidc/authorize
```

6. Run `docker-compose up -d` on HedgeDoc to apply your settings.
7. Sign in to your HedgeDoc using your Authelia login
