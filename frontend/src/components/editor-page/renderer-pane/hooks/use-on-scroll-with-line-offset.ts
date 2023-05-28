/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getGlobalState } from '../../../../redux'
import type { ScrollState } from '../../synced-scroll/scroll-props'
import type { ScrollCallback } from '../../synced-scroll/scroll-props'
import { useMemo } from 'react'

/**
 * Adjusts the given onScroll callback to include the frontmatter line offset.
 *
 * @param onScroll The callback that posts a scroll state
 * @return the modified callback that posts the same scroll state but with line offset
 */
export const useOnScrollWithLineOffset = (onScroll: ScrollCallback | undefined): ScrollCallback | undefined => {
  return useMemo(() => {
    if (onScroll === undefined) {
      return undefined
    } else {
      return (scrollState: ScrollState) => {
        onScroll({
          firstLineInView: scrollState.firstLineInView + getGlobalState().noteDetails.startOfContentLineOffset,
          scrolledPercentage: scrollState.scrolledPercentage
        })
      }
    }
  }, [onScroll])
}
