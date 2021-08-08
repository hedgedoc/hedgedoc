# Private API Auth

## Supported kinds of authentication

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

## How the authentication works

The backend is called directly from the frontend. The different routes that handle different kinds of authentication perform any kind of verification needed and then create a session cookie. This session cookie is than provided with each subsequent call to the private api by the frontend (until it expires or the user logs out). The SessionGuard, which is added to each other (appropriate) controller method of the private api, checks if the provided session is still valid and provides the controller method with the correct user.
