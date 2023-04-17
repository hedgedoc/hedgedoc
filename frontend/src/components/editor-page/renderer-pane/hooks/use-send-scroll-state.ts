/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSendToRenderer } from '../../../render-page/window-post-message-communicator/hooks/use-send-to-renderer'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'
import type { ScrollState } from '../../synced-scroll/scroll-props'
import equal from 'fast-deep-equal'
import { useMemo, useRef } from 'react'

/**
 * Sends the given {@link ScrollState scroll state} to the renderer if the content changed.
 *
 * @param scrollState The scroll state to send
 * @param rendererReady Defines if the target renderer is ready
 */
export const useSendScrollState = (scrollState: ScrollState | undefined, rendererReady: boolean): void => {
  const oldScrollState = useRef<ScrollState | undefined>(undefined)

  useSendToRenderer(
    useMemo(() => {
      if (!scrollState || equal(scrollState, oldScrollState.current)) {
        return
      }
      oldScrollState.current = scrollState
      return { type: CommunicationMessageType.SET_SCROLL_STATE, scrollState }
    }, [scrollState]),
    rendererReady
  )
}
