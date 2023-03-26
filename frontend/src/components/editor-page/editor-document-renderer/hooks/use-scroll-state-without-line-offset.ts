/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNoteDetails } from '../../../../hooks/common/use-note-details'
import type { ScrollState } from '../../synced-scroll/scroll-props'
import { useMemo } from 'react'

/**
 * Adjusts the given {@link ScrollState scroll state} to exclude the frontmatter line offset.
 *
 * @param scrollState The original scroll state with the line offset
 * @return the adjusted scroll state without the line offset
 */
export const useScrollStateWithoutLineOffset = (scrollState: ScrollState | undefined): ScrollState | undefined => {
  const lineOffset = useNoteDetails().frontmatterRendererInfo.lineOffset
  return useMemo(() => {
    return scrollState === undefined
      ? undefined
      : {
          firstLineInView: scrollState.firstLineInView - lineOffset,
          scrolledPercentage: scrollState.scrolledPercentage
        }
  }, [lineOffset, scrollState])
}
