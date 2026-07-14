/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ScrollState } from './scroll-props'

/**
 * Uses a middle-based search through the lineStartIndexes to find the line number for a given position.
 *
 * @param lineStartIndexes The list of line start indexes in the content.
 * @param position The position in the content.
 * @returns The line number of the position in the content.
 */
const findLineNumberForPosition = (lineStartIndexes: number[], position: number): number => {
  let lowerBound = 0
  let upperBound = lineStartIndexes.length - 1

  while (lowerBound <= upperBound) {
    const middle = Math.floor((lowerBound + upperBound) / 2)
    const lineStartIndex = lineStartIndexes[middle]
    const nextLineStartIndex = lineStartIndexes[middle + 1]

    if (lineStartIndex === undefined) {
      break
    }
    if (position < lineStartIndex) {
      upperBound = middle - 1
    } else if (nextLineStartIndex !== undefined && position >= nextLineStartIndex) {
      lowerBound = middle + 1
    } else {
      return middle + 1
    }
  }

  return 1
}

/**
 * Converts the local CodeMirror selection position into a line-based scroll state.
 * This is used by slide sync, where the cursor line selects the active slide.
 * The scrolledPercentage is always 0 because this is not required for slide syncing.
 *
 * @param lineStartIndexes The absolute start positions of all lines in the note
 * @param cursorPosition The local user's cursor position in the note
 */
export const buildCursorLineScrollState = (
  lineStartIndexes: number[],
  cursorPosition: number | undefined
): ScrollState | null => {
  if (cursorPosition === undefined || lineStartIndexes.length === 0) {
    return null
  }

  return {
    firstLineInView: findLineNumberForPosition(lineStartIndexes, cursorPosition),
    scrolledPercentage: 0
  }
}
