/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ORIGIN, useBaseUrl } from '../../../../hooks/common/use-base-url'
import { Logger } from '../../../../utils/logger'
import { useEditorToRendererCommunicator } from '../../../editor-page/render-context/editor-to-renderer-communicator-context-provider'
import type { RefObject } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTimeoutFn } from '../../../../hooks/common/use-timeout-fn'

const log = new Logger('IframeLoader')

/**
 * Generates a callback for an iframe load handler, that enforces a given URL if frame navigates away.
 *
 * @param iFrameReference A reference to the iframe react dom element.
 * @param onNavigateAway An optional callback that is executed when the iframe leaves the enforced URL.
 */
export const useForceRenderPageUrlOnIframeLoadCallback = (
  iFrameReference: RefObject<HTMLIFrameElement>,
  onNavigateAway: () => void
): (() => void) => {
  const iframeCommunicator = useEditorToRendererCommunicator()
  const rendererBaseUrl = useBaseUrl(ORIGIN.RENDERER)
  const forcedUrl = useMemo(() => {
    const renderUrl = new URL(rendererBaseUrl)
    renderUrl.pathname += 'render'
    if (iframeCommunicator !== undefined) {
      renderUrl.searchParams.set('uuid', iframeCommunicator.getUuid())
    }
    return renderUrl.toString()
  }, [iframeCommunicator, rendererBaseUrl])
  const redirectionInProgress = useRef<boolean>(false)

  const loadedAtLeastOnce = useRef(false)

  const onIframeLoad = useCallback(() => {
    const frame = iFrameReference.current

    if (!frame) {
      log.debug('No frame in reference')
      return
    }

    if (redirectionInProgress.current) {
      redirectionInProgress.current = false
      log.debug('Redirect complete')
    } else {
      const oldUrl = frame.src === '' ? '(none)' : frame.src
      log.warn(`Navigated away from unknown URL. Was ${oldUrl}. Forcing back to ${forcedUrl}`)
      loadedAtLeastOnce.current = true
      onNavigateAway?.()
      redirectionInProgress.current = true
      frame.src = forcedUrl
    }
  }, [iFrameReference, onNavigateAway, forcedUrl])

  const [startForceTimer, stopForceTimer] = useTimeoutFn(
    500,
    useCallback(() => {
      if (loadedAtLeastOnce.current) {
        return
      }
      log.debug('Forced load of iframe')
      onIframeLoad()
    }, [onIframeLoad])
  )

  useEffect(() => {
    startForceTimer()
    return () => stopForceTimer()
  }, [startForceTimer, stopForceTimer])

  return onIframeLoad
}
