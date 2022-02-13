/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { stringSplice } from './utils/string-splice'
import type { CursorSelection } from '../../../editor/types'

/**
 * Creates a new {@link NoteDetails note state} but replaces the selected text.
 *
 * @param markdownContent The content of the document to modify
 * @param selection If the selection has no to cursor then text will only be inserted.
 *                  If the selection has a to cursor then the selection will be replaced.
 * @param insertText The text that should be inserted
 * @return The modified state
 */
export const replaceSelection = (
  markdownContent: string,
  selection: CursorSelection,
  insertText: string
): [string, CursorSelection] => {
  const fromCursor = selection.from
  const toCursor = selection.to ?? selection.from

  const newContent = stringSplice(markdownContent, fromCursor, insertText, toCursor - fromCursor)
  return [newContent, { from: fromCursor, to: insertText.length + fromCursor }]
}
