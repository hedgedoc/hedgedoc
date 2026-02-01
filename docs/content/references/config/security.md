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

## Content Security Policy (CSP)

HedgeDoc implements Content Security Policy headers to protect against cross-site scripting (XSS),
clickjacking, and other code injection attacks. The CSP configuration uses secure defaults and can
be extended to allow additional trusted sources.

### Default Security Policy

By default, HedgeDoc's CSP allows:

- **Scripts**: Only from the same origin (`'self'`)
- **Styles**: From the same origin with inline styles for Next.js compatibility
  (`'self'`, `'unsafe-inline'`)
- **Images**: From the same origin, data URIs, blob URIs, YouTube thumbnails, Vimeo
  thumbnails, and Bootstrap CDN
- **Frames**: From the same origin, YouTube embeds, and Vimeo embeds
- **Connections**: From the same origin
- **Forms**: Submissions only to the same origin

When `HD_RENDERER_BASE_URL` is set to a different domain than `HD_BASE_URL`, the renderer domain
is automatically added to the `frame-src` directive.

### CSP Configuration

CSP can be customized to allow additional trusted sources for your deployment. All additional
sources must be valid URLs with `http://` or `https://` protocol (or `ws://`/`wss://` for
`HD_SECURITY_CSP_ADDITIONAL_CONNECT_SRC`).

| environment variable                        | default | description                                                                      |
|---------------------------------------------|---------|----------------------------------------------------------------------------------|
| `HD_SECURITY_CSP_ENABLE`                    | `true`  | Enable or disable CSP headers                                                    |
| `HD_SECURITY_CSP_REPORT_ONLY`               | `false` | Enable report-only mode (logs violations without blocking)                       |
| `HD_SECURITY_CSP_REPORT_URI`                | *none*  | URI to send CSP violation reports to                                             |
| `HD_SECURITY_CSP_ADDITIONAL_SCRIPT_SRC`     | *none*  | Additional sources for JavaScript (comma-separated list of URLs)                 |
| `HD_SECURITY_CSP_ADDITIONAL_STYLE_SRC`      | *none*  | Additional sources for stylesheets (comma-separated list of URLs)                |
| `HD_SECURITY_CSP_ADDITIONAL_IMG_SRC`        | *none*  | Additional sources for images (comma-separated list of URLs)                     |
| `HD_SECURITY_CSP_ADDITIONAL_FRAME_SRC`      | *none*  | Additional sources for frames/iframes (comma-separated list of URLs)             |
| `HD_SECURITY_CSP_ADDITIONAL_CONNECT_SRC`    | *none*  | Additional sources for connections (comma-separated URLs, supports WebSocket)    |

### Examples

Allow loading images from your corporate CDN:

```bash
HD_SECURITY_CSP_ADDITIONAL_IMG_SRC=https://cdn.mycorp.example.com
```

Allow embedding content from multiple trusted sources:

```bash
HD_SECURITY_CSP_ADDITIONAL_FRAME_SRC=https://embed1.example.com,https://embed2.example.com
```

Allow WebSocket connections to your custom service:

```bash
HD_SECURITY_CSP_ADDITIONAL_CONNECT_SRC=https://api.example.com,wss://ws.example.com
```

Enable report-only mode for testing (logs violations without blocking):

```bash
HD_SECURITY_CSP_REPORT_ONLY=true
HD_SECURITY_CSP_REPORT_URI=https://csp-reports.example.com/report
```
