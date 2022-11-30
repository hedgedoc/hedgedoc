/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentEdits } from './types/changes'
import type { CursorSelection } from './types/cursor-selection'

/**
 * Creates a copy of the given markdown content lines but wraps the selection.
 *
 * @param selection If the selection has no to-cursor then nothing will happen.
 *                  If the selection has a to-cursor then the selected text will be wrapped.
 * @param symbolStart A text that will be inserted before the from-cursor
 * @param symbolEnd A text that will be inserted after the to-cursor
 * @return the modified copy of lines
 */
export const wrapSelection = (
  selection: CursorSelection,
  symbolStart: string,
  symbolEnd: string
): [ContentEdits, CursorSelection] => {
  if (selection.to === undefined) {
    return [[], selection]
  }

  const to = selection.to
  const from = selection.from
  const changes: ContentEdits = [
    {
      from: from,
      to: from,
      insert: symbolStart
    },
    {
      from: to,
      to: to,
      insert: symbolEnd
    }
  ]

  return [changes, { from, to: to + symbolEnd.length + symbolStart.length }]
}
