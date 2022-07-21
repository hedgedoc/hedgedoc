/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useMemo } from 'react'

export enum ORIGIN_TYPE {
  EDITOR,
  RENDERER
}

/**
 * Returns the url origin of the editor or the renderer.
 */
export const useOriginFromConfig = (originType: ORIGIN_TYPE): string => {
  const originFromConfig = useApplicationState((state) =>
    originType === ORIGIN_TYPE.EDITOR
      ? state.config.iframeCommunication.editorOrigin
      : state.config.iframeCommunication.rendererOrigin
  )

  return useMemo(() => {
    return process.env.NEXT_PUBLIC_IGNORE_IFRAME_ORIGIN_CONFIG !== undefined
      ? window.location.origin + '/'
      : originFromConfig ?? ''
  }, [originFromConfig])
}
