/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { stringSplice } from './utils/string-splice'
import type { CursorSelection } from '../../../editor/types'

/**
 * Creates a copy of the given markdown content lines but wraps the selection.
 *
 * @param markdownContentLines The lines of the document to modify
 * @param selection If the selection has no to cursor then nothing will happen.
 *                  If the selection has a to cursor then the selected text will be wrapped.
 * @param symbolStart A text that will be inserted before the from cursor
 * @param symbolEnd A text that will be inserted after the to cursor
 * @return the modified copy of lines
 */
export const wrapSelection = (
  markdownContentLines: string[],
  selection: CursorSelection,
  symbolStart: string,
  symbolEnd: string
): string[] => {
  if (selection.to === undefined) {
    return markdownContentLines
  }

  const to = selection.to ?? selection.from
  const from = selection.from

  return markdownContentLines.map((currentLine, currentLineIndex) => {
    if (currentLineIndex === to.line) {
      if (to.line === from.line) {
        const moddedLine = stringSplice(currentLine, to.character, symbolEnd)
        return stringSplice(moddedLine, from.character, symbolStart)
      } else {
        return stringSplice(currentLine, to.character, symbolEnd)
      }
    } else if (currentLineIndex === from.line) {
      return stringSplice(currentLine, from.character, symbolStart)
    } else {
      return currentLine
    }
  })
}
