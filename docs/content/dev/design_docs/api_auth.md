# API Authentication

## Public API
All requests to the public API require authentication using a [bearer token](https://datatracker.ietf.org/doc/html/rfc6750).

This token can be generated using the profile page in the frontend
(which in turn uses the private API to generate the token).

## Private API

The private API uses a session cookie to authenticate the user.
Sessions are handled using passport.js.

The backend hands out a new session token after the user has successfully authenticated
using one of the supported authentication methods:

- Username & Password (`local`)
- LDAP
- SAML
- OAuth2
- GitLab
- GitHub
- Facebook
- Twitter
- Dropbox
- Google

The `SessionGuard`, which is added to each (appropriate) controller method of the private API,
checks if the provided session is still valid and provides the controller method with the correct user.
