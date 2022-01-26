/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NoteDetails } from '../types/note-details'
import type { CursorSelection } from '../../editor/types'

export const buildStateFromUpdateCursorPosition = (state: NoteDetails, selection: CursorSelection): NoteDetails => {
  return {
    ...state,
    selection
  }
}
