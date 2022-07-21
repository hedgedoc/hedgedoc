/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RefObject } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Logger } from '../../../../utils/logger'

const log = new Logger('IframeLoader')

/**
 * Generates a callback for an iframe load handler, that enforces a given URL if frame navigates away.
 *
 * @param iFrameReference A reference to the iframe react dom element.
 * @param rendererOrigin The base url that should be enforced.
 * @param onNavigateAway An optional callback that is executed when the iframe leaves the enforced URL.
 */
export const useForceRenderPageUrlOnIframeLoadCallback = (
  iFrameReference: RefObject<HTMLIFrameElement>,
  rendererOrigin: string,
  onNavigateAway?: () => void
): (() => void) => {
  const forcedUrl = useMemo(() => `${rendererOrigin}render`, [rendererOrigin])
  const redirectionInProgress = useRef<boolean>(false)

  const loadCallback = useCallback(() => {
    const frame = iFrameReference.current

    if (!frame) {
      log.debug('No frame in reference')
      return
    }

    if (redirectionInProgress.current) {
      redirectionInProgress.current = false
      log.debug('Redirect complete')
    } else {
      log.warn(`Navigated away from unknown URL. Forcing back to ${forcedUrl}`)
      onNavigateAway?.()
      redirectionInProgress.current = true
      frame.src = forcedUrl
    }
  }, [iFrameReference, onNavigateAway, forcedUrl])

  useEffect(() => {
    loadCallback()
  }, [loadCallback])

  return loadCallback
}
