/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CursorSelection } from '../../../components/editor-page/editor-pane/tool-bar/formatters/types/cursor-selection'
import type { NoteDetails } from '../types'

export const buildStateFromUpdateCursorPosition = (state: NoteDetails, selection: CursorSelection): NoteDetails => {
  const correctedSelection = isFromAfterTo(selection)
    ? {
        to: selection.from,
        from: selection.to as number
      }
    : selection

  return {
    ...state,
    selection: correctedSelection
  }
}

/**
 * Checks if the from-cursor position in the given selection is after the to -cursor position.
 *
 * @param selection The cursor selection to check
 * @return {@link true} if the from-cursor position is after the to position
 */
const isFromAfterTo = (selection: CursorSelection): boolean => {
  if (selection.to === undefined) {
    return false
  }
  return selection.from > selection.to
}
