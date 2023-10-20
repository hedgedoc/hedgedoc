/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { useMemo } from 'react'

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
export const useLineBasedToPosition = (): LineBasedPosition | null => {
  const lineStartIndexes = useApplicationState((state) => state.noteDetails?.markdownContent.lineStartIndexes ?? [])
  const selectionTo = useApplicationState((state) => state.noteDetails?.selection.to)

  return useMemo(() => {
    if (selectionTo === undefined) {
      return null
    }
    return calculateLineBasedPosition(selectionTo, lineStartIndexes)
  }, [selectionTo, lineStartIndexes])
}

/**
 * Returns the line+character based position of the from-cursor.
 */
export const useLineBasedFromPosition = (): LineBasedPosition => {
  const lineStartIndexes = useApplicationState((state) => state.noteDetails?.markdownContent.lineStartIndexes ?? [])
  const selection = useApplicationState((state) => state.noteDetails?.selection ?? { from: 0 })

  return useMemo(() => {
    return calculateLineBasedPosition(selection.from, lineStartIndexes)
  }, [selection.from, lineStartIndexes])
}
