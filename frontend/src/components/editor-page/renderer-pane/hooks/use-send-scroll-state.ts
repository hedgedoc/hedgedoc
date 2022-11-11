/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useRef } from 'react'
import type { ScrollState } from '../../synced-scroll/scroll-props'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'
import equal from 'fast-deep-equal'
import { useEditorToRendererCommunicator } from '../../render-context/editor-to-renderer-communicator-context-provider'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

/**
 * Sends the given {@link ScrollState scroll state} to the renderer if the content changed.
 *
 * @param scrollState The scroll state to send
 */
export const useSendScrollState = (scrollState: ScrollState | undefined): void => {
  const iframeCommunicator = useEditorToRendererCommunicator()
  const oldScrollState = useRef<ScrollState | undefined>(undefined)
  const rendererReady = useApplicationState((state) => state.rendererStatus.rendererReady)

  useEffect(() => {
    if (rendererReady && scrollState && !equal(scrollState, oldScrollState.current)) {
      oldScrollState.current = scrollState
      iframeCommunicator.sendMessageToOtherSide({ type: CommunicationMessageType.SET_SCROLL_STATE, scrollState })
    }
  }, [iframeCommunicator, rendererReady, scrollState])
}
