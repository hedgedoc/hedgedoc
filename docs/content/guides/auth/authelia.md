# OAuth with Authelia SSO (self-hosted)

## Prerequisites

This guide assumes you have run and configured [Authelia](https://www.authelia.com/). If you want to get Authelia running quickly, there are example docker-compose files in the [Authelia Github repository](https://github.com/authelia/authelia/tree/master/examples/compose).
Also this guides assumes you run HedgeDoc via a [Docker container](../../setup/docker.md). Find out how the mentioned config environment variables are mapped to entries in the config file at our [configuration page](../../configuration.md).

## Steps

1. Set up the necessary OpenID Connect parameters in your Authelia `configuration.yml` as explained in the [documentation](https://www.authelia.com/configuration/identity-providers/openid-connect/provider/).
   Make sure to generate safe secrets (such as `LENGTH=64; tr -cd '[:alnum:]' < /dev/urandom | fold -w "${LENGTH}" | head -n 1 | tr -d '\n' ; echo`)

2. A completed `identity_providers` section of the configuration may look like the following (the chosen Client ID shouldn't actually be this guessable for safety reasons):
```yaml
identity_providers:
  oidc:
    ## Load the HMAC secret dynamically from a Docker secret file
    hmac_secret: '{{ secret "/run/secrets/authelia_hmac_secret" }}'
    
    ## Load the OIDC Private Key dynamically into the new JWKS structure
    jwks:
      - key_id: 'primary'
        algorithm: 'RS256'
        use: 'sig'
        # The templating engine reads the secret file, indents it by 10 spaces, 
        # and formats it correctly for YAML using msquote and mindent.
        key: {{ secret "/run/secrets/authelia_oidc_private_key.pem" | mindent 10 "|" | msquote }}
        
    access_token_lifespan: 1h
    authorize_code_lifespan: 1m
    id_token_lifespan: 1h
    refresh_token_lifespan: 90m
    enable_client_debug_messages: false
    
    clients:
      - client_id: '<random client id>'
        client_name: 'HedgeDoc'
        
        ## In 4.38+, Authelia heavily recommends storing the Client Secret as a HASH, not plaintext.
        ## You give HedgeDoc the plaintext password, but store the hashed version here.
        ## Generate this hash using the 'authelia crypto hash generate' CLI command.
        client_secret: '<hashed client secret>' 
        
        public: false
        authorization_policy: two_factor
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
        token_endpoint_auth_method: 'client_secret_post'
```
(Note: As of Authelia v4.38.0+, issuer_private_key was deprecated and replaced by jwks. The configuration above uses Authelia's templating engine to securely load the private key and HMAC secret from external Docker secrets files, avoiding plaintext keys in your YAML).

1. Restart Authelia to apply to new configuration and check for any errors in the log.

2. In the `docker-compose.yml` of HedgeDoc add the following environment variables (you can choose different attributes for e.g. the display name - all available attributes you can find in the [scope definitions](https://www.authelia.com/docs/configuration/identity-providers/oidc.html#scope-definitions)):
```yaml
- CMD_URL_ADDPORT=false
- CMD_PROTOCOL_USESSL=true
- CMD_OAUTH2_PROVIDERNAME=Authelia
- CMD_OAUTH2_CLIENT_ID=<client id here>
# NOTE: Use the plaintext client secret here, NOT the hashed one used in Authelia's configuration
- CMD_OAUTH2_CLIENT_SECRET=<plaintext client secret here>
- CMD_OAUTH2_SCOPE=openid email profile
- CMD_OAUTH2_USER_PROFILE_USERNAME_ATTR=sub
- CMD_OAUTH2_USER_PROFILE_DISPLAY_NAME_ATTR=name
- CMD_OAUTH2_USER_PROFILE_EMAIL_ATTR=email
- CMD_OAUTH2_USER_PROFILE_URL=https://<your-authelia-url>/api/oidc/userinfo
- CMD_OAUTH2_TOKEN_URL=https://<your-authelia-url>/api/oidc/token
- CMD_OAUTH2_AUTHORIZATION_URL=https://<your-authelia-url>/api/oidc/authorization
```
3. Run docker-compose up -d on HedgeDoc to apply your settings.

4. Sign in to your HedgeDoc using your Authelia login.
