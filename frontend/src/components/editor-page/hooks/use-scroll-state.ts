/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { Logger } from '../../../utils/logger'
import type { ScrollSource } from '../editor-page-content'
import type { ScrollState } from '../synced-scroll/scroll-props'
import type { RefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'

const log = new Logger('useScrollState')

/**
 * Provides a {@link ScrollState} state and a function that updates the scroll state to a new value.
 *
 * @param scrollSourceRef The reference that defines which scroll source is active
 * @param scrollSource The source for which the state should be created
 * @return the created scroll state and the update function. The update function accepts only new values if the given scroll source isn't active to prevent callback loops.
 */
export const useScrollState = (
  scrollSourceRef: RefObject<ScrollSource>,
  scrollSource: ScrollSource
): [scrollState: ScrollState, onScroll: (newScrollState: ScrollState) => void] => {
  const editorSyncScroll: boolean = useApplicationState((state) => state.editorConfig.syncScroll)

  const [scrollState, setScrollState] = useState<ScrollState>(() => ({
    firstLineInView: 1,
    scrolledPercentage: 0
  }))

  const onScroll = useCallback(
    (newScrollState: ScrollState) => {
      if (scrollSourceRef.current !== scrollSource && editorSyncScroll) {
        setScrollState(newScrollState)
      }
    },
    [editorSyncScroll, scrollSource, scrollSourceRef]
  )

  useEffect(() => {
    log.debug(`New scroll state for ${scrollSource}`, scrollState)
  }, [scrollSource, scrollState])

  return [scrollState, onScroll]
}
