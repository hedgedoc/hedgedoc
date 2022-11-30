/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentEdits } from './types/changes'
import type { CursorSelection } from './types/cursor-selection'
import { searchForEndOfLine, searchForStartOfLine } from './utils/change-cursors-to-whole-line-if-no-to-cursor'

/**
 * Creates a copy of the given markdown content lines but modifies the whole selected lines.
 *
 * @param markdownContent The lines of the document to modify
 * @param selection If the selection has no to-cursor then only the from-line will be modified.
 *                  If the selection has a to-cursor then all lines in the selection will be modified.
 * @param modifyLine A function that modifies the selected lines
 * @return the modified copy of lines
 */
export const prependLinesOfSelection = (
  markdownContent: string,
  selection: CursorSelection,
  modifyLine: (line: string, lineIndexInBlock: number) => string
): [ContentEdits, CursorSelection] => {
  const toIndex = selection.to ?? selection.from
  let currentIndex = selection.from
  let indexInBlock = 0
  let newStartOfSelection = selection.from
  let newEndOfSelection = toIndex
  let lengthOfAddedPrefixes = 0
  const changes: ContentEdits = []
  while (currentIndex <= toIndex && currentIndex <= markdownContent.length) {
    const startOfLine = searchForStartOfLine(markdownContent, currentIndex)
    if (startOfLine < newStartOfSelection) {
      newStartOfSelection = startOfLine
    }
    const endOfLine = searchForEndOfLine(markdownContent, currentIndex)
    const line = markdownContent.slice(startOfLine, endOfLine)
    const linePrefix = modifyLine(line, indexInBlock)
    lengthOfAddedPrefixes += linePrefix.length
    indexInBlock += 1
    changes.push({
      from: startOfLine,
      to: startOfLine,
      insert: linePrefix
    })
    currentIndex = endOfLine + 1
    if (endOfLine + lengthOfAddedPrefixes > newEndOfSelection) {
      newEndOfSelection = endOfLine + lengthOfAddedPrefixes
    }
  }
  return [changes, { from: newStartOfSelection, to: newEndOfSelection }]
}
