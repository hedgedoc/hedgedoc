/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { CursorSelection } from '../../../editor/types'
import { searchForEndOfLine, searchForStartOfLine } from './utils/change-cursors-to-whole-line-if-no-to-cursor'
import { stringSplice } from './utils/string-splice'

/**
 * Creates a copy of the given markdown content lines but modifies the whole selected lines.
 *
 * @param markdownContentLines The lines of the document to modify
 * @param selection If the selection has no to cursor then only the from line will be modified.
 *                  If the selection has a to cursor then all lines in the selection will be modified.
 * @param replacer A function that modifies the selected lines
 * @return the modified copy of lines
 */
export const prependLinesOfSelection = (
  markdownContentLines: string,
  selection: CursorSelection,
  generatePrefix: (line: string, lineIndexInBlock: number) => string
): [string, CursorSelection] => {
  let currentContent = markdownContentLines
  let toIndex = selection.to ?? selection.from
  let currentIndex = selection.from
  let indexInBlock = 0
  let newStartOfSelection = selection.from
  let newEndOfSelection = toIndex
  while (currentIndex <= toIndex && currentIndex < currentContent.length) {
    const startOfLine = searchForStartOfLine(currentContent, currentIndex)
    if (startOfLine < newStartOfSelection) {
      newStartOfSelection = startOfLine
    }
    const endOfLine = searchForEndOfLine(currentContent, currentIndex)
    const line = currentContent.slice(startOfLine, endOfLine)
    const replacement = generatePrefix(line, indexInBlock)
    indexInBlock += 1
    currentContent = stringSplice(currentContent, startOfLine, replacement)
    toIndex += replacement.length
    const newEndOfLine = endOfLine + replacement.length
    currentIndex = newEndOfLine + 1
    if (newEndOfLine > newEndOfSelection) {
      newEndOfSelection = newEndOfLine
    }
  }
  return [currentContent, { from: newStartOfSelection, to: newEndOfSelection }]
}
