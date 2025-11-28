/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initial-state'
import { buildStateFromServerInterface } from './reducers/build-state-from-set-note-data-from-server'
import { buildStateFromUpdatedMarkdownContent } from './build-state-from-updated-markdown-content'
import { buildStateFromServerPermissions } from './reducers/build-state-from-server-permissions'
import { buildStateFromFirstHeadingUpdate } from './reducers/build-state-from-first-heading-update'
import { buildStateFromMetadataUpdate } from './reducers/build-state-from-metadata-update'
import type { CursorSelection } from '../../components/editor-page/editor-pane/tool-bar/formatters/types/cursor-selection'
import { buildStateFromUpdateCursorPosition } from './reducers/build-state-from-update-cursor-position'
import type { NoteInterface, NoteMetadataInterface, NotePermissionsInterface } from '@hedgedoc/commons'

const noteDetailsSlice = createSlice({
  name: 'noteDetails',
  initialState,
  reducers: {
    setNoteDataFromServer(_, action: PayloadAction<{ note: NoteInterface; noteId: string }>) {
      return buildStateFromServerInterface(action.payload.note, action.payload.noteId)
    },
    setNoteContent(state, action: PayloadAction<string>) {
      return buildStateFromUpdatedMarkdownContent(state, action.payload)
    },
    setNotePermissionsFromServer(state, action: PayloadAction<NotePermissionsInterface>) {
      return buildStateFromServerPermissions(state, action.payload)
    },
    updateNoteTitleByFirstHeading(state, action: PayloadAction<string | undefined>) {
      return buildStateFromFirstHeadingUpdate(state, action.payload)
    },
    updateMetadata(state, action: PayloadAction<NoteMetadataInterface>) {
      return buildStateFromMetadataUpdate(state, action.payload)
    },
    updateCursorPosition(state, action: PayloadAction<CursorSelection>) {
      return buildStateFromUpdateCursorPosition(state, action.payload)
    },
    unloadNote() {
      return initialState
    }
  }
})

export const noteDetailsActionsCreator = noteDetailsSlice.actions
export const noteDetailsReducer = noteDetailsSlice.reducer
