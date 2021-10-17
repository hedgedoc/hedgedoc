/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSendToRenderer } from '../../../render-page/window-post-message-communicator/hooks/use-send-to-renderer'
import { useMemo, useRef } from 'react'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import type { RendererFrontmatterInfo } from '../../../common/note-frontmatter/types'
import equal from 'fast-deep-equal'

/**
 * Extracts the {@link RendererFrontmatterInfo frontmatter data}
 * from the global application state and sends it to the renderer.
 */
export const useSendFrontmatterInfoFromReduxToRenderer = (): void => {
  const frontmatterInfo = useApplicationState((state) => state.noteDetails.frontmatterRendererInfo)
  const lastFrontmatter = useRef<RendererFrontmatterInfo | undefined>(undefined)

  const cachedFrontmatterInfo = useMemo(() => {
    if (lastFrontmatter.current !== undefined && equal(lastFrontmatter.current, frontmatterInfo)) {
      return lastFrontmatter.current
    } else {
      lastFrontmatter.current = frontmatterInfo
      return frontmatterInfo
    }
  }, [frontmatterInfo])

  return useSendToRenderer(
    useMemo(
      () => ({
        type: CommunicationMessageType.SET_FRONTMATTER_INFO,
        frontmatterInfo: cachedFrontmatterInfo
      }),
      [cachedFrontmatterInfo]
    )
  )
}
