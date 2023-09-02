/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { extractBaseUrls } from './utils/base-url-from-env-extractor'

/**
 * Next.js middleware that checks if the expected and the current origin align.
 *
 * @param request The current request to check
 */
export function middleware(request: NextRequest) {
  const currentOrigin = determineOriginFromHeaders(request.headers)
  const expectedOrigin = determineExpectedOrigin(request)

  if (currentOrigin === expectedOrigin) {
    return
  }

  return new NextResponse(
    `You can't open this page using this URL. For this endpoint "${expectedOrigin}" is expected.`,
    {
      status: 400,
      headers: { 'content-type': 'text/plain' }
    }
  )
}

/**
 * Determines the host and protocol of the current request by checking the host or x-forwarded-host header.
 *
 * @param headers The request headers provided by Next.js
 */
const determineOriginFromHeaders = (headers: Headers): string | undefined => {
  const host = headers.get('x-forwarded-host') ?? headers.get('host')
  if (host === null) {
    return undefined
  }

  const protocol = headers.get('x-forwarded-proto')?.split(',')[0] ?? 'http'
  return `${protocol}://${host}`
}

/**
 * Uses the current route to determine the expected origin.
 *
 * @param request The current request
 */
const determineExpectedOrigin = (request: NextRequest): string => {
  return new URL(request.nextUrl.pathname === '/render' ? extractBaseUrls().renderer : extractBaseUrls().editor).origin
}
