<!--
SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Security

This page describes security-related configuration options for HedgeDoc.

## Rate Limiting

HedgeDoc implements rate limiting to protect against abuse and brute-force attacks. Rate limiting applies different limits based on the authentication level and endpoint type.

### Rate Limit Tiers

HedgeDoc uses four different rate limit tiers:

1. **Public API (with API token)**: For authenticated API token requests to public endpoints (`/api/v2/*`)
2. **Private API (authenticated)**: For logged-in user requests to private endpoints (`/api/private/*`)
3. **Private API (unauthenticated)**: For guest or unauthenticated requests to private/public endpoints
4. **Login endpoints**: For authentication endpoints (strictest limits to prevent brute force attacks)

### Rate Limit Tracking

Rate limits are tracked differently based on authentication state:

- **Authenticated requests** (session or API token): Tracked per user ID
- **Unauthenticated requests**: Tracked per IP address

This allows authenticated users to switch between devices/networks without hitting rate limits unnecessarily, while still protecting against abuse from unauthenticated sources.

### Configuration

Each rate limit tier can be configured with two values:

- `MAX`: Maximum number of requests allowed
- `WINDOW`: Time window in seconds for the limit

Setting a `MAX` value to `0` effectively disables rate limiting for that tier (not recommended for production).

| environment variable                             | default | description                                                      |
|--------------------------------------------------|---------|------------------------------------------------------------------|
| `HD_SECURITY_RATE_LIMIT_PUBLIC_MAX`              | 150     | Maximum requests for public API with auth token                  |
| `HD_SECURITY_RATE_LIMIT_PUBLIC_WINDOW`           | 300     | Time window in seconds for public API limit (5 minutes)          |
| `HD_SECURITY_RATE_LIMIT_PRIVATE_AUTH_MAX`        | 600     | Maximum requests for authenticated private API                   |
| `HD_SECURITY_RATE_LIMIT_PRIVATE_AUTH_WINDOW`     | 300     | Time window in seconds for authenticated private API (5 minutes) |
| `HD_SECURITY_RATE_LIMIT_PRIVATE_UNAUTH_MAX`      | 100     | Maximum requests for unauthenticated private/public API          |
| `HD_SECURITY_RATE_LIMIT_PRIVATE_UNAUTH_WINDOW`   | 300     | Time window in seconds for unauthenticated API (5 minutes)       |
| `HD_SECURITY_RATE_LIMIT_LOGIN_MAX`               | 20      | Maximum login attempts                                           |
| `HD_SECURITY_RATE_LIMIT_LOGIN_WINDOW`            | 600     | Time window in seconds for login attempts (10 minutes)           |

### Rate Limit Response

When a rate limit is exceeded, the server responds with:

- **HTTP Status Code**: 429 (Too Many Requests)
- **Error Message**: Indicates how many requests are allowed and when to retry
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed in the time window
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Timestamp when the limit resets
  - `Retry-After`: Seconds until the limit resets

### Examples

#### High-Traffic Public Instance

For a public instance with many authenticated users:

```bash
HD_SECURITY_RATE_LIMIT_PUBLIC_MAX=300
HD_SECURITY_RATE_LIMIT_PUBLIC_WINDOW=300
HD_SECURITY_RATE_LIMIT_PRIVATE_AUTH_MAX=1000
HD_SECURITY_RATE_LIMIT_PRIVATE_AUTH_WINDOW=300
HD_SECURITY_RATE_LIMIT_PRIVATE_UNAUTH_MAX=50
HD_SECURITY_RATE_LIMIT_PRIVATE_UNAUTH_WINDOW=300
HD_SECURITY_RATE_LIMIT_LOGIN_MAX=10
HD_SECURITY_RATE_LIMIT_LOGIN_WINDOW=900
```

#### Private Instance

For a small private instance where users are trusted:

```bash
HD_SECURITY_RATE_LIMIT_PUBLIC_MAX=1000
HD_SECURITY_RATE_LIMIT_PUBLIC_WINDOW=60
HD_SECURITY_RATE_LIMIT_PRIVATE_AUTH_MAX=5000
HD_SECURITY_RATE_LIMIT_PRIVATE_AUTH_WINDOW=60
HD_SECURITY_RATE_LIMIT_PRIVATE_UNAUTH_MAX=200
HD_SECURITY_RATE_LIMIT_PRIVATE_UNAUTH_WINDOW=60
HD_SECURITY_RATE_LIMIT_LOGIN_MAX=50
HD_SECURITY_RATE_LIMIT_LOGIN_WINDOW=300
```

### Notes

- Rate limits do not impact normal user behavior during typical note editing sessions
- WebSocket connections for real-time collaboration are not rate-limited
- Rate limit state is stored in-memory and does not persist across server restarts
- For multi-instance deployments, each instance maintains its own rate limit counters
