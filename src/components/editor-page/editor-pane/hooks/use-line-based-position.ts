/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

export interface LineBasedPosition {
  line: number
  character: number
}

const calculateLineBasedPosition = (absolutePosition: number, lineStartIndexes: number[]): LineBasedPosition => {
  const foundLineIndex = lineStartIndexes.findIndex((startIndex) => absolutePosition < startIndex)
  const line = foundLineIndex === -1 ? lineStartIndexes.length - 1 : foundLineIndex - 1
  return {
    line: line,
    character: absolutePosition - lineStartIndexes[line]
  }
}

/**
 * Returns the line+character based position of the to-cursor, if available.
 */
export const useLineBasedToPosition = (): LineBasedPosition | undefined => {
  const lineStartIndexes = useApplicationState((state) => state.noteDetails.markdownContent.lineStartIndexes)
  const selection = useApplicationState((state) => state.noteDetails.selection)

  return useMemo(() => {
    const to = selection.to
    if (to === undefined) {
      return undefined
    }
    return calculateLineBasedPosition(to, lineStartIndexes)
  }, [selection.to, lineStartIndexes])
}

/**
 * Returns the line+character based position of the from-cursor.
 */
export const useLineBasedFromPosition = (): LineBasedPosition => {
  const lineStartIndexes = useApplicationState((state) => state.noteDetails.markdownContent.lineStartIndexes)
  const selection = useApplicationState((state) => state.noteDetails.selection)

  return useMemo(() => {
    return calculateLineBasedPosition(selection.from, lineStartIndexes)
  }, [selection.from, lineStartIndexes])
}
