/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { headers } from 'next/headers'
import type { PropsWithChildren } from 'react'
import React from 'react'

export interface ExpectedOriginBoundaryProps extends PropsWithChildren {
  expectedOrigin: string
}

export const buildOriginFromHeaders = (): string | undefined => {
  const headers1 = headers()
  const host = headers1.get('x-forwarded-host') ?? headers1.get('host')
  if (host === null) {
    return undefined
  }

  const protocol = headers1.get('x-forwarded-proto')?.split(',')[0] ?? 'http'
  return `${protocol}://${host}`
}

export const ExpectedOriginBoundary: React.FC<ExpectedOriginBoundaryProps> = ({ children, expectedOrigin }) => {
  const currentOrigin = buildOriginFromHeaders()

  if (new URL(expectedOrigin).origin !== currentOrigin) {
    return (
      <span
        className={
          'text-white bg-dark'
        }>{`You can't open this page using this URL. For this endpoint "${expectedOrigin}" is expected.`}</span>
    )
  }
  return children
}
