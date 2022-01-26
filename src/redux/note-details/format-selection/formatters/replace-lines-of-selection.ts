/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { CursorSelection } from '../../../editor/types'

/**
 * Creates a copy of the given markdown content lines but modifies the whole selected lines.
 *
 * @param markdownContentLines The lines of the document to modify
 * @param selection If the selection has no to cursor then only the from line will be modified.
 *                  If the selection has a to cursor then all lines in the selection will be modified.
 * @param replacer A function that modifies the selected lines
 * @return the modified copy of lines
 */
export const replaceLinesOfSelection = (
  markdownContentLines: string[],
  selection: CursorSelection,
  replacer: (line: string, lineIndexInBlock: number) => string
): string[] => {
  const toLineIndex = selection.to?.line ?? selection.from.line
  return markdownContentLines.map((currentLine, currentLineIndex) => {
    if (currentLineIndex < selection.from.line || currentLineIndex > toLineIndex) {
      return currentLine
    } else {
      const lineIndexInBlock = currentLineIndex - selection.from.line
      return replacer(currentLine, lineIndexInBlock)
    }
  })
}
