/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NoteDetails } from '../types/note-details'
import type { CursorSelection } from '../../editor/types'
import { buildStateFromUpdatedMarkdownContentLines } from '../build-state-from-updated-markdown-content'
import { replaceSelection } from '../format-selection/formatters/replace-selection'

export const buildStateFromReplaceSelection = (state: NoteDetails, text: string, cursorSelection?: CursorSelection) => {
  return buildStateFromUpdatedMarkdownContentLines(
    state,
    replaceSelection(state.markdownContentLines, cursorSelection ? cursorSelection : state.selection, text)
  )
}
