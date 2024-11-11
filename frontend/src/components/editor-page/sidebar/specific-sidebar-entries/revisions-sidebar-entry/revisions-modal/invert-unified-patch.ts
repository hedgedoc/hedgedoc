/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Hunk, ParsedDiff } from 'diff'

/**
 * Inverts a given unified patch.
 * A patch that e.g. adds a line, will remove it then.
 *
 * @param parsedDiff The patch to invert
 * @return The inverted patch
 */
export const invertUnifiedPatch = (parsedDiff: ParsedDiff): ParsedDiff => {
  const { oldFileName, newFileName, oldHeader, newHeader, hunks, index } = parsedDiff

  const newHunks: Hunk[] = hunks.map((hunk) => {
    const { oldLines, oldStart, newLines, newStart, lines } = hunk
    return {
      oldLines: newLines,
      oldStart: newStart,
      newLines: oldLines,
      newStart: oldStart,
      lines: lines.map((line) => {
        if (line.startsWith('-')) {
          return `+${line.slice(1)}`
        } else if (line.startsWith('+')) {
          return `-${line.slice(1)}`
        } else {
          return line
        }
      })
    }
  })

  return {
    hunks: newHunks,
    index: index,
    newFileName: oldFileName,
    newHeader: oldHeader,
    oldFileName: newFileName,
    oldHeader: newHeader
  }
}
