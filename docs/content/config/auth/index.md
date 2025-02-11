# Authentication

HedgeDoc supports multiple authentication mechanisms that can be enabled and configured.
An authentication method is always linked to an account on the HedgeDoc instance.
However, an account can also have multiple authentication methods linked.

Each user has a unique username.
By this username, other users can invite them to their notes.

When first logging in with a new authentication method, a new account will be created.
If a user already has an account, they can link a new authentication method in their settings.

## Supported authentication methods

- [Username and password (Local account)](./local.md)
- [LDAP](./ldap.md)
- [OpenID Connect (OIDC)](./oidc.md)

While HedgeDoc provides a basic local account system, we recommend using an external
authentication mechanism for most environments.

For LDAP and OIDC you can configure multiple auth providers of that type.
You need to give each of them a unique identifier that is used in the configuration
and in the database.
The identifier should consist of only letters (`a-z`, `A-Z`), numbers (`0-9`), and dashes (`-`).

## Profile sync

A HedgeDoc account stores generic profile information like the display name of the
user and optionally a URL to a profile picture.
Depending on your configuration, users can change this information in their settings.
You can also configure HedgeDoc to sync this information from an external source like
LDAP or OIDC. In this case, changes made by the user will be overridden on login with
the external source, that is configured as sync source.

## Account merging

There's no built-in account merging in HedgeDoc. So if you registered with different
auth methods, you will have different accounts.
To manually resolve this situation, you can do the following:

1. Log in with the second account (this should be merged into the first one).
2. Visit every note, you own on that account and change the note ownership to your first account.
3. Ensure, there's nothing left anymore. Then delete the second account.
4. Log in with the first account.
5. Link the auth method of the former second account to your account in the settings.

## Common configuration

| environment variable            | default   | example                                                                         | description                                                                                                                                                           |
|---------------------------------|-----------|---------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `HD_SESSION_SECRET`             | (not set) | `5aaea9250828ce6942b35d170a385e74c41f1f05`, just random data                    | **Required.** The secret used to sign the session cookie.                                                                                                             |
| `HD_SESSION_LIFETIME`           | `1209600` | `604800`, `1209600`                                                             | The lifetime of a session in seconds. After this time without activity, a user will be logged out.                                                                    |
| `HD_AUTH_ALLOW_PROFILE_EDITS`   | `true`    | `true`, `false`                                                                 | Allow users to edit their profile information.                                                                                                                        |
| `HD_AUTH_ALLOW_CHOOSE_USERNAME` | `true`    | `true`,  `false`                                                                | If enabled, users may freely choose their username when signing-up via an external auth source (OIDC). Otherwise the username from the external auth source is taken. |
| `HD_AUTH_SYNC_SOURCE`           | (not set) | `gitlab`, if there's an auth method (LDAP or OIDC) with the identifier `gitlab` | If enabled, the auth method with the configured identifier will update user's profile information on login.                                                           |
