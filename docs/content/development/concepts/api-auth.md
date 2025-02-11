# API Authentication

!!! info "Design Document"
    This is a design document, explaining the design and vision for a HedgeDoc 2
    feature. It is not a user guide and may or may not be fully implemented.

## Public API

All requests to the public API require authentication using a [bearer token][bearer-token].

This token can be generated using the profile page in the frontend
(which in turn uses the private API to generate the token).

### Token generation

When a new token is requested via the private API, the backend generates a 64 bytes-long secret of
cryptographically secure data and returns it as a base64url-encoded string,
along with an identifier. That string can then be used by clients as a bearer token.

A SHA-512 hash of the secret is stored in the database. To validate tokens, the backend computes
the hash of the providedsecret and checks it against the stored hash for the provided identifier.

#### Choosing a hash function

Unfortunately, there does not seem to be any explicit documentation about our exact use-case.
Most docs describe classic password-saving scenarios and recommend bcrypt, scrypt or argon2.
These hashing functions are slow to stop brute-force or dictionary attacks, which would expose
the original, user-provided password, that may have been reused across multiple services.

We have a very different scenario:
Our API tokens are 64 bytes of cryptographically strong pseudorandom data.
Brute-force or dictionary attacks are therefore virtually impossible, and tokens are not
reused across multiple services.
We therefore need to only guard against one scenario:
An attacker gains read-only access to the database. Saving only hashes in the database prevents the
attacker from authenticating themselves as a user. The hash-function does not need to be very slow,
as the randomness of the original token prevents inverting the hash. The function actually needs to
be reasonably fast, as the hash must be computed on every request to the public API.
SHA-512 (or alternatively SHA3) fits this use-case.

## Private API

The private API uses a session cookie to authenticate the user.
Sessions are handled using [passport.js](https://www.passportjs.org/).

The backend hands out a new session token after the user has successfully authenticated
using one of the supported authentication methods:

- Username & Password (`local`)
- LDAP
- OIDC

The `SessionGuard`, which is added to each (appropriate) controller method of the private API,
checks if the provided session is still valid and provides the controller method
with the correct user.

[bearer-token]: https://datatracker.ietf.org/doc/html/rfc6750
