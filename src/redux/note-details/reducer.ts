/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Reducer } from 'redux'
import type { NoteDetailsActions } from './types'
import { NoteDetailsActionType } from './types'
import { initialState } from './initial-state'
import type { NoteDetails } from './types/note-details'
import { buildStateFromUpdatedMarkdownContent } from './build-state-from-updated-markdown-content'
import { buildStateFromUpdateCursorPosition } from './reducers/build-state-from-update-cursor-position'
import { buildStateFromFirstHeadingUpdate } from './reducers/build-state-from-first-heading-update'
import { buildStateFromServerDto } from './reducers/build-state-from-set-note-data-from-server'
import { buildStateFromServerPermissions } from './reducers/build-state-from-server-permissions'
import { buildStateFromMetadataUpdate } from './reducers/build-state-from-metadata-update'

export const NoteDetailsReducer: Reducer<NoteDetails, NoteDetailsActions> = (
  state: NoteDetails = initialState,
  action: NoteDetailsActions
) => {
  switch (action.type) {
    case NoteDetailsActionType.UPDATE_CURSOR_POSITION:
      return buildStateFromUpdateCursorPosition(state, action.selection)
    case NoteDetailsActionType.SET_DOCUMENT_CONTENT:
      return buildStateFromUpdatedMarkdownContent(state, action.content)
    case NoteDetailsActionType.SET_NOTE_PERMISSIONS_FROM_SERVER:
      return buildStateFromServerPermissions(state, action.notePermissionsFromServer)
    case NoteDetailsActionType.UPDATE_NOTE_TITLE_BY_FIRST_HEADING:
      return buildStateFromFirstHeadingUpdate(state, action.firstHeading)
    case NoteDetailsActionType.SET_NOTE_DATA_FROM_SERVER:
      return buildStateFromServerDto(action.noteFromServer)
    case NoteDetailsActionType.UPDATE_METADATA:
      return buildStateFromMetadataUpdate(state, action.updatedMetadata)
    default:
      return state
  }
}
