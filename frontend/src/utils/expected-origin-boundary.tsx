/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBaseUrl } from '../hooks/common/use-base-url'
import React, { Fragment, useMemo } from 'react'
import type { PropsWithChildren } from 'react'

export interface ExpectedOriginBoundaryProps {
  currentOrigin?: string
}

/**
 * Checks if the url of the current browser window matches the expected origin.
 * This is necessary to ensure that the render endpoint is only opened from the rendering origin.
 *
 * @param children The children react element that should be rendered if the origin is correct
 * @param currentOrigin the current origin from client or server side rendering context
 */
export const ExpectedOriginBoundary: React.FC<PropsWithChildren<ExpectedOriginBoundaryProps>> = ({
  children,
  currentOrigin
}) => {
  const baseUrl = useBaseUrl()
  const expectedOrigin = useMemo(() => new URL(baseUrl).origin, [baseUrl])

  if (currentOrigin !== expectedOrigin) {
    return (
      <span
        className={
          'text-white bg-dark'
        }>{`You can't open this page using this URL. For this endpoint "${expectedOrigin}" is expected.`}</span>
    )
  } else {
    return <Fragment>{children}</Fragment>
  }
}
