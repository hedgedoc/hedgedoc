/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isClientSideRendering } from './is-client-side-rendering'
import type { NextPageContext } from 'next'

/**
 * Determines the location origin of the current request.
 * Client side rendering will use the browsers window location.
 * Server side rendering will use the http request.
 *
 * @param context The next page context that contains the http headers
 * @return the determined request origin. Will be undefined if no origin could be determined.
 */
export const determineCurrentOrigin = (context: NextPageContext): string | undefined => {
  if (isClientSideRendering()) {
    return window.location.origin
  }
  const headers = context.req?.headers
  if (headers === undefined) {
    return undefined
  }

  const protocol = headers['x-forwarded-proto'] ?? 'http'
  const host = headers['x-forwarded-host'] ?? headers['host']
  if (host === undefined) {
    return undefined
  }

  return `${protocol as string}://${host as string}`
}
