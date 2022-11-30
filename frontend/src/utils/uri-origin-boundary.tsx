/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBaseUrl } from '../hooks/common/use-base-url'
import { isClientSideRendering } from './is-client-side-rendering'
import React, { Fragment, useMemo } from 'react'
import type { PropsWithChildren } from 'react'

/**
 * Checks if the url of the current browser window matches the expected origin.
 * This is necessary to ensure that the render endpoint is only opened from the rendering origin.
 *
 * @param children The children react element that should be rendered if the origin is correct
 */
export const ExpectedOriginBoundary: React.FC<PropsWithChildren> = ({ children }) => {
  const baseUrl = useBaseUrl()
  const expectedOrigin = useMemo(() => new URL(baseUrl).origin, [baseUrl])

  if (isClientSideRendering() && window.location.origin !== expectedOrigin) {
    return <span>{`You can't open this page using this URL. For this endpoint "${expectedOrigin}" is expected.`}</span>
  } else {
    return <Fragment>{children}</Fragment>
  }
}
