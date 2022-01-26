/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FormatType } from '../types'
import { wrapSelection } from './formatters/wrap-selection'
import { addLink } from './formatters/add-link'
import { replaceLinesOfSelection } from './formatters/replace-lines-of-selection'
import type { CursorSelection } from '../../editor/types'
import { changeCursorsToWholeLineIfNoToCursor } from './formatters/utils/change-cursors-to-whole-line-if-no-to-cursor'
import { replaceSelection } from './formatters/replace-selection'

export const applyFormatTypeToMarkdownLines = (
  markdownContentLines: string[],
  selection: CursorSelection,
  type: FormatType
): string[] => {
  switch (type) {
    case FormatType.BOLD:
      return wrapSelection(markdownContentLines, selection, '**', '**')
    case FormatType.ITALIC:
      return wrapSelection(markdownContentLines, selection, '*', '*')
    case FormatType.STRIKETHROUGH:
      return wrapSelection(markdownContentLines, selection, '~~', '~~')
    case FormatType.UNDERLINE:
      return wrapSelection(markdownContentLines, selection, '++', '++')
    case FormatType.SUBSCRIPT:
      return wrapSelection(markdownContentLines, selection, '~', '~')
    case FormatType.SUPERSCRIPT:
      return wrapSelection(markdownContentLines, selection, '^', '^')
    case FormatType.HIGHLIGHT:
      return wrapSelection(markdownContentLines, selection, '==', '==')
    case FormatType.CODE_FENCE:
      return wrapSelection(
        markdownContentLines,
        changeCursorsToWholeLineIfNoToCursor(markdownContentLines, selection),
        '```\n',
        '\n```'
      )
    case FormatType.UNORDERED_LIST:
      return replaceLinesOfSelection(markdownContentLines, selection, (line) => `- ${line}`)
    case FormatType.ORDERED_LIST:
      return replaceLinesOfSelection(
        markdownContentLines,
        selection,
        (line, lineIndexInBlock) => `${lineIndexInBlock + 1}. ${line}`
      )
    case FormatType.CHECK_LIST:
      return replaceLinesOfSelection(markdownContentLines, selection, (line) => `- [ ] ${line}`)
    case FormatType.QUOTES:
      return replaceLinesOfSelection(markdownContentLines, selection, (line) => `> ${line}`)
    case FormatType.HEADER_LEVEL:
      return replaceLinesOfSelection(markdownContentLines, selection, (line) =>
        line.startsWith('#') ? `#${line}` : `# ${line}`
      )
    case FormatType.HORIZONTAL_LINE:
      return replaceSelection(markdownContentLines, { from: selection.to ?? selection.from }, '\n----')
    case FormatType.COMMENT:
      return replaceSelection(markdownContentLines, { from: selection.to ?? selection.from }, '\n> []')
    case FormatType.COLLAPSIBLE_BLOCK:
      return wrapSelection(
        markdownContentLines,
        changeCursorsToWholeLineIfNoToCursor(markdownContentLines, selection),
        ':::spoiler Toggle label\n',
        '\n:::'
      )
    case FormatType.LINK:
      return addLink(markdownContentLines, selection)
    case FormatType.IMAGE_LINK:
      return addLink(markdownContentLines, selection, '!')
    default:
      return markdownContentLines
  }
}
