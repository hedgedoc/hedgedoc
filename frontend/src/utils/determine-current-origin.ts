/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isClientSideRendering } from './is-client-side-rendering'
import { Optional } from '@mrdrogdrog/optional'
import type { IncomingHttpHeaders } from 'http'
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
  return Optional.ofNullable(context.req?.headers)
    .flatMap((headers) => buildOriginFromHeaders(headers))
    .orElse(undefined)
}

const buildOriginFromHeaders = (headers: IncomingHttpHeaders) => {
  const rawHost = headers['x-forwarded-host'] ?? headers['host']
  return extractFirstValue(rawHost).map((host) => {
    const protocol = extractFirstValue(headers['x-forwarded-proto']).orElse('http')
    return `${protocol}://${host}`
  })
}

const extractFirstValue = (rawValue: string | string[] | undefined): Optional<string> => {
  return Optional.ofNullable(rawValue)
    .map((value) => (typeof value === 'string' ? value : value[0]))
    .map((value) => value.split(',')[0])
}
