/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { headers } from 'next/headers'
import type { AwaitedReactNode } from 'react'
import React from 'react'

export interface ExpectedOriginBoundaryProps {
  expectedOrigin: string
  children?: AwaitedReactNode | undefined
}

/**
 * Determines the host and protocol of the current request by checking the host or x-forwarded-host header.
 *
 * @return the calculated request origin or {@code undefined} if no host header has been found
 */
export const buildOriginFromHeaders = async (): Promise<string | undefined> => {
  const currentHeader = await headers()
  const host = currentHeader.get('x-forwarded-host') ?? currentHeader.get('host')
  if (host === null) {
    return undefined
  }

  const protocol = currentHeader.get('x-forwarded-proto')?.split(',')[0] ?? 'http'
  return `${protocol}://${host}`
}

/**
 * This boundary lets the given children pass if the current request origin is matching the expected origin for this route.
 * Otherwise, an error message is shown instead.
 *
 * @param children the children to show if the origin passes
 * @param expectedOrigin The origin that should match the request's origin
 */
export async function ExpectedOriginBoundary({
  children,
  expectedOrigin
}: ExpectedOriginBoundaryProps): Promise<React.AwaitedReactNode> {
  const currentOrigin = await buildOriginFromHeaders()

  if (new URL(expectedOrigin).origin !== currentOrigin) {
    return (
      <span>{`You can't open this page using this URL. For this endpoint "${expectedOrigin}" is expected but got "${currentOrigin}".`}</span>
    )
  }
  return children
}
