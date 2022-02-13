/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NoteDetails } from '../types/note-details'
import type { FormatType } from '../types'
import { buildStateFromUpdatedMarkdownContent } from '../build-state-from-updated-markdown-content'
import { applyFormatTypeToMarkdownLines } from '../format-selection/apply-format-type-to-markdown-lines'

export const buildStateFromSelectionFormat = (state: NoteDetails, type: FormatType): NoteDetails => {
  const [newContent, newSelection] = applyFormatTypeToMarkdownLines(state.markdownContent.plain, state.selection, type)
  const newState = buildStateFromUpdatedMarkdownContent(state, newContent)
  return {
    ...newState,
    selection: newSelection
  }
}
