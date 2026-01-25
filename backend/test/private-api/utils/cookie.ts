/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Extracts the cookie name=value pair from a Set-Cookie header.
 * Strips out attributes like HttpOnly, Secure, Path, etc.
 * Header format: Set-Cookie format: "name=value; HttpOnly; Path=/; ..."
 *
 * @param setCookieHeader The full Set-Cookie header value
 * @returns Just the name=value part of the cookie
 */
export function extractCookieValue(setCookieHeader: string): string {
  return setCookieHeader.split(';')[0];
}
