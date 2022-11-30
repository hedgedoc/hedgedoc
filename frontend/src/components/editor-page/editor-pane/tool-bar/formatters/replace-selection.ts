/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentEdits } from './types/changes'
import type { CursorSelection } from './types/cursor-selection'

/**
 * Creates a new {@link NoteDetails note state} but replaces the selected text.
 *
 * @param selection If the selection has no to-cursor then text will only be inserted.
 *                  If the selection has a to-cursor then the selection will be replaced.
 * @param insertText The text that should be inserted
 * @param insertNewLine If the selection should be prefixed with a new-line-character.
 * @return The modified state
 */
export const replaceSelection = (
  selection: CursorSelection,
  insertText: string,
  insertNewLine?: boolean
): [ContentEdits, CursorSelection] => {
  const fromCursor = selection.from
  const toCursor = selection.to ?? selection.from

  const changes: ContentEdits = [
    {
      from: fromCursor,
      to: toCursor,
      insert: (insertNewLine ? '\n' : '') + insertText
    }
  ]
  return [changes, { from: fromCursor, to: insertText.length + fromCursor + (insertNewLine ? 1 : 0) }]
}
