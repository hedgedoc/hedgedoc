# OpenID Connect (OIDC)

HedgeDoc can use one or multiple OIDC servers to authenticate users. To do this, you first need
to tell HedgeDoc identifiers for the servers you want to use (`HD_AUTH_OIDC_SERVERS`). Then you
need to provide the configuration for these OIDC servers depending on how you want to use them.

Each of these variables will contain the identifier for the OIDC server.
For example, if you chose the identifier `MYOIDC` for your OIDC server, all variables
for this server will start with `HD_AUTH_OIDC_MYOIDC_`.

Replace `$NAME` with the identifier of the OIDC server in the table below accordingly.

| environment variable                 | default          | example                                    | description                                                                                                                                       |
|--------------------------------------|------------------|--------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `HD_AUTH_OIDC_SERVERS`               | -                | `MYOIDC`                                   | A comma-seperated list of identifiers of OIDC servers HedgeDoc should use.                                                                        |
| `HD_AUTH_OIDC_$NAME_PROVIDER_NAME`   | `OpenID Connect` | `My OIDC Single-Sign-On`                   | The display name for the OIDC server, that is shown in the UI of HegdeDoc.                                                                        |
| `HD_AUTH_OIDC_$NAME_ISSUER`          | -                | `https://auth.example.com`                 | The base url of the OIDC issuer. It should serve a file `.well-known/openid-configuration`                                                        |
| `HD_AUTH_OIDC_$NAME_CLIENT_ID`       | -                | `hd2`                                      | The id with which HedgeDoc is registered at the OIDC server.                                                                                      |
| `HD_AUTH_OIDC_$NAME_CLIENT_SECRET`   | -                | `c3f70208375cf26700920678ec55b7df7cd75266` | The secret for the HedgeDoc application, given by the OIDC server.                                                                                |
| `HD_AUTH_OIDC_$NAME_THEME`           | -                | `gitlab`, `google`, ...                    | The theme in which the button on the login page should be displayed. See below for a list of options. If not defined, a generic one will be used. |
| `HD_AUTH_OIDC_$NAME_ENABLE_REGISTER` | `true`           | `true`, `false`                            | If set to `false`, only users that already exist in the HedgeDoc server are able to login.                                                        |

As redirect URL you should configure
`https://hedgedoc.example.com/api/private/auth/oidc/$NAME/callback` where `$NAME`
is the identifier of the OIDC server. Remember to update the domain to your one.

You can also configure servers that only support plain OAuth2 but
no OIDC (e.g., GitHub or Discord). In this case, you need the following additional variables:

| environment variable                       | default              | example                                    | description                                                                              |
|--------------------------------------------|----------------------|--------------------------------------------|------------------------------------------------------------------------------------------|
| `HD_AUTH_OIDC_$NAME_AUTHORIZE_URL`         | -                    | `https://auth.example.com/oauth2/auth`     | The URL to which the user should be redirected to start the OAuth2 flow.                 |
| `HD_AUTH_OIDC_$NAME_TOKEN_URL`             | -                    | `https://auth.example.com/oauth2/token`    | The URL to which the user should be redirected to exchange the code for an access token. |
| `HD_AUTH_OIDC_$NAME_USERINFO_URL`          | -                    | `https://auth.example.com/oauth2/userinfo` | The URL to which the user should be redirected to get the user information.              |
| `HD_AUTH_OIDC_$NAME_END_SESSION_URL`       | -                    | `https://auth.example.com/oauth2/logout`   | The URL to which the user should be redirected to end the session.                       |
| `HD_AUTH_OIDC_$NAME_SCOPE`                 | -                    | `profile`                                  | The scope that should be requested to get the user information.                          |
| `HD_AUTH_OIDC_$NAME_USER_ID_FIELD`         | `sub`                | `sub`, `id`                                | The unique identifier that is returned for the user from the OAuth2 provider.            |
| `HD_AUTH_OIDC_$NAME_USER_ID_FIELD`         | `sub`                | `sub`, `id`                                | The unique identifier that is returned for the user from the OAuth2 provider.            |
| `HD_AUTH_OIDC_$NAME_USER_NAME_FIELD`       | `preferred_username` | `preferred_username`, `username`           | The unique identifier that is returned for the user from the OAuth2 provider.            |
| `HD_AUTH_OIDC_$NAME_DISPLAY_NAME_FIELD`    | `name`               | `name`, `displayName`                      | The field that contains the display name of the user.                                    |
| `HD_AUTH_OIDC_$NAME_PROFILE_PICTURE_FIELD` | -                    | `picture`, `avatar`                        | The field that contains the URL to the profile picture of the user.                      |
| `HD_AUTH_OIDC_$NAME_EMAIL_FIELD`           | `email`              | `email`, `mail`                            | The field that contains the email address of the user.                                   |

## Themes

To integrate the brand colors and icons of some popular OIDC providers into the login button,
you can use one of the following values:

- `google`
- `github`
- `gitlab`
- `facebook`
- `discord`
- `mastodon`
- `azure`

## Common providers

| Provider  | support     | issuer variable                                                           | Docs                                                                                                 |
|-----------|-------------|---------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| Google    | OIDC        | `https://accounts.google.com`                                             | [Google Docs](https://developers.google.com/identity/openid-connect/openid-connect)                  |
| GitHub    | only OAuth2 | `https://github.com`                                                      | [GitHub Docs](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps) |
| GitLab    | OIDC        | `https://gitlab.com` or your instance domain                              | [GitLab Docs](https://docs.gitlab.com/ee/integration/openid_connect_provider.html)                   |
| Facebook  | OIDC        | `https://www.facebook.com`                                                | [Facebook Docs](https://developers.facebook.com/docs/facebook-login/overview)                        |
| Discord   | only OAuth2 | `https://discord.com`                                                     | [Discord Docs](https://discord.com/developers/docs/topics/oauth2)                                    |
| Azure     | OIDC        | `https://login.microsoftonline.com/{tenant}/v2.0`, replace accordingly    | [Azure OIDC](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc)      |
| Auth0     | OIDC        | `https://{yourDomain}.us.auth0.com/`, replace accordingly                 | [Auth0 OIDC](https://auth0.com/docs/authenticate/protocols/openid-connect-protocol)                  |
| Keycloak  | OIDC        | `https://keycloak.example.com/auth/realms/{realm}`, replace accordingly   | [Keycloak Docs](https://www.keycloak.org/docs/latest/server_admin/#sso-protocols)                    |
| Authentik | OIDC        | `https://authentik.example.com/application/o/{app}/`, replace accordingly | [Authentik Docs](https://docs.goauthentik.io/docs/providers/oauth2/)                                 |
| Authelia  | OIDC        | `https://authelia.example.com`, replace accordingly                       | [Authelia Docs](https://www.authelia.com/integration/openid-connect/introduction/)                   |
