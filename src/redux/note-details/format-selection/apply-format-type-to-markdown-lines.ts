/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FormatType } from '../types'
import { wrapSelection } from './formatters/wrap-selection'
import { addLink } from './formatters/add-link'
import { prependLinesOfSelection } from './formatters/prepend-lines-of-selection'
import type { CursorSelection } from '../../editor/types'
import { changeCursorsToWholeLineIfNoToCursor } from './formatters/utils/change-cursors-to-whole-line-if-no-to-cursor'
import { replaceSelection } from './formatters/replace-selection'

export const applyFormatTypeToMarkdownLines = (
  markdownContent: string,
  selection: CursorSelection,
  type: FormatType
): [string, CursorSelection] => {
  switch (type) {
    case FormatType.BOLD:
      return wrapSelection(markdownContent, selection, '**', '**')
    case FormatType.ITALIC:
      return wrapSelection(markdownContent, selection, '*', '*')
    case FormatType.STRIKETHROUGH:
      return wrapSelection(markdownContent, selection, '~~', '~~')
    case FormatType.UNDERLINE:
      return wrapSelection(markdownContent, selection, '++', '++')
    case FormatType.SUBSCRIPT:
      return wrapSelection(markdownContent, selection, '~', '~')
    case FormatType.SUPERSCRIPT:
      return wrapSelection(markdownContent, selection, '^', '^')
    case FormatType.HIGHLIGHT:
      return wrapSelection(markdownContent, selection, '==', '==')
    case FormatType.CODE_FENCE:
      return wrapSelection(
        markdownContent,
        changeCursorsToWholeLineIfNoToCursor(markdownContent, selection),
        '```\n',
        '\n```'
      )
    case FormatType.UNORDERED_LIST:
      return prependLinesOfSelection(markdownContent, selection, () => `- `)
    case FormatType.ORDERED_LIST:
      return prependLinesOfSelection(
        markdownContent,
        selection,
        (line, lineIndexInBlock) => `${lineIndexInBlock + 1}. `
      )
    case FormatType.CHECK_LIST:
      return prependLinesOfSelection(markdownContent, selection, () => `- [ ] `)
    case FormatType.QUOTES:
      return prependLinesOfSelection(markdownContent, selection, () => `> `)
    case FormatType.HEADER_LEVEL:
      return prependLinesOfSelection(markdownContent, selection, (line) => (line.startsWith('#') ? `#` : `# `))
    case FormatType.HORIZONTAL_LINE:
      return replaceSelection(markdownContent, { from: selection.to ?? selection.from }, '\n----')
    case FormatType.COMMENT:
      return replaceSelection(markdownContent, { from: selection.to ?? selection.from }, '\n> []')
    case FormatType.COLLAPSIBLE_BLOCK:
      return wrapSelection(
        markdownContent,
        changeCursorsToWholeLineIfNoToCursor(markdownContent, selection),
        ':::spoiler Toggle label\n',
        '\n:::'
      )
    case FormatType.LINK:
      return addLink(markdownContent, selection)
    case FormatType.IMAGE_LINK:
      return addLink(markdownContent, selection, '!')
    default:
      return [markdownContent, selection]
  }
}
