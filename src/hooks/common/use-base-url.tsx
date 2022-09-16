/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useContext, useMemo } from 'react'
import { useRouter } from 'next/router'
import { baseUrlContext } from '../../components/common/base-url/base-url-context-provider'

export enum ORIGIN {
  EDITOR,
  RENDERER,
  CURRENT_PAGE
}

/**
 * Provides the base urls for the editor and the renderer.
 */
export const useBaseUrl = (origin = ORIGIN.CURRENT_PAGE): string => {
  const baseUrls = useContext(baseUrlContext)
  if (!baseUrls) {
    throw new Error('No base url context received. Did you forget to use the provider component?')
  }

  const router = useRouter()

  return useMemo(() => {
    return (router.route === '/render' && origin === ORIGIN.CURRENT_PAGE) || origin === ORIGIN.RENDERER
      ? baseUrls.renderer
      : baseUrls.editor
  }, [origin, baseUrls.renderer, baseUrls.editor, router.route])
}
