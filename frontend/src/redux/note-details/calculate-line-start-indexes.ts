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
  const indexArray = new Uint32Array(markdownContentLines.length)
  for (let i = 0; i < markdownContentLines.length; i++) {
    indexArray[i] = i === 0 ? 0 : indexArray[i - 1] + markdownContentLines[i - 1].length + 1
  }
  return Array.from(indexArray)
}
