<!--
SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Security

This page describes security-related configuration options for HedgeDoc.

## Rate Limiting

HedgeDoc implements rate limiting to protect against abuse and brute-force attacks. Rate limiting
applies different limits based on the authentication level and endpoint type.

1. **Public API**: For requests to the public API using a valid API-token
2. **Authenticated**: For requests to the app by logged-in users
3. **Unauthenticated**: For requests to the app or API by unauthenticated users or guests
4. **Auth**: For requests to the auth endpoints (login, register, etc.)

Rate limits are tracked differently based on authentication state:

- **Authenticated requests** (session or API token): Tracked per user ID
- **Unauthenticated requests**: Tracked per IP address

When a rate limit is exceeded, the server responds with the HTTP 429 status code and includes
information about the limit and when to retry in the headers `X-RateLimit-Limit`,
`X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `Retry-After`.

### Configuration

Each rate limit tier can be configured with two values:

- `*_MAX`: Maximum number of requests allowed
- `*_WINDOW`: Time window in seconds for the limit

Setting a `*_MAX` value to `0` effectively disables rate limiting for that tier
(not recommended for production).

| environment variable                            | default | description                                                        |
|-------------------------------------------------|---------|--------------------------------------------------------------------|
| `HD_SECURITY_RATE_LIMIT_PUBLIC_API_MAX`         | 150     | Number of maximum requests for the public API with auth token      |
| `HD_SECURITY_RATE_LIMIT_PUBLIC_API_WINDOW`      | 300     | Time window in seconds for public API limit                        |
| `HD_SECURITY_RATE_LIMIT_AUTHENTICATED_MAX`      | 900     | Maximum requests for authenticated usage                           |
| `HD_SECURITY_RATE_LIMIT_AUTHENTICATED_WINDOW`   | 300     | Time window in seconds for authenticated usage                     |
| `HD_SECURITY_RATE_LIMIT_UNAUTHENTICATED_MAX`    | 100     | Maximum requests for unauthenticated usage                         |
| `HD_SECURITY_RATE_LIMIT_UNAUTHENTICATED_WINDOW` | 300     | Time window in seconds for unauthenticated usage                   |
| `HD_SECURITY_RATE_LIMIT_AUTH_MAX`               | 20      | Maximum of auth request attempts                                   |
| `HD_SECURITY_RATE_LIMIT_AUTH_WINDOW`            | 600     | Time window in seconds for auth request attempts                   |
| `HD_SECURITY_RATE_LIMIT_BYPASS`                 | *none*  | Bypass rate limiting for these IP addresses (comma-separated list) |
