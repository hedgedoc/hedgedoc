/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Calculates the absolute start position of every line.
 *
 * @param markdownContentLines The lines of the document
 * @returns the calculated line starts
 */
export const calculateLineStartIndexes = (markdownContentLines: string[]): number[] => {
  return markdownContentLines.reduce((state, line, lineIndex, lines) => {
    state[lineIndex] = lineIndex === 0 ? 0 : state[lineIndex - 1] + lines[lineIndex - 1].length + 1
    return state
  }, new Array<number>(markdownContentLines.length))
}
