/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initial-state'
import { buildStateFromServerDto } from './reducers/build-state-from-set-note-data-from-server'
import { buildStateFromUpdatedMarkdownContent } from './build-state-from-updated-markdown-content'
import { buildStateFromServerPermissions } from './reducers/build-state-from-server-permissions'
import { buildStateFromFirstHeadingUpdate } from './reducers/build-state-from-first-heading-update'
import { buildStateFromMetadataUpdate } from './reducers/build-state-from-metadata-update'
import type { CursorSelection } from '../../components/editor-page/editor-pane/tool-bar/formatters/types/cursor-selection'
import { buildStateFromUpdateCursorPosition } from './reducers/build-state-from-update-cursor-position'
import type { NoteDto, NoteMetadataDto, NotePermissionsDto } from '@hedgedoc/commons'

const noteDetailsSlice = createSlice({
  name: 'noteDetails',
  initialState,
  reducers: {
    setNoteDataFromServer(_, action: PayloadAction<NoteDto>) {
      return buildStateFromServerDto(action.payload)
    },
    setNoteContent(state, action: PayloadAction<string>) {
      return buildStateFromUpdatedMarkdownContent(state, action.payload)
    },
    setNotePermissionsFromServer(state, action: PayloadAction<NotePermissionsDto>) {
      return buildStateFromServerPermissions(state, action.payload)
    },
    updateNoteTitleByFirstHeading(state, action: PayloadAction<string | undefined>) {
      return buildStateFromFirstHeadingUpdate(state, action.payload)
    },
    updateMetadata(state, action: PayloadAction<NoteMetadataDto>) {
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
