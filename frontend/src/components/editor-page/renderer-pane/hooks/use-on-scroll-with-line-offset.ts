/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getGlobalState } from '../../../../redux'
import type { ScrollCallback, ScrollState } from '../../synced-scroll/scroll-props'
import { useMemo } from 'react'

/**
 * Adjusts the given onScroll callback to include the frontmatter line offset.
 *
 * @param onScroll The callback that posts a scroll state
 * @return the modified callback that posts the same scroll state but with line offset
 */
export const useOnScrollWithLineOffset = (onScroll: ScrollCallback | null): ScrollCallback | null => {
  return useMemo(() => {
    if (onScroll === null) {
      return null
    } else {
      return (scrollState: ScrollState) => {
        const noteDetails = getGlobalState().noteDetails
        if (noteDetails === null) {
          return null
        }
        onScroll({
          firstLineInView: scrollState.firstLineInView + noteDetails.startOfContentLineOffset,
          scrolledPercentage: scrollState.scrolledPercentage
        })
      }
    }
  }, [onScroll])
}
