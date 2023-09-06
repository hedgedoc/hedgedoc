/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { buildStateFromUpdatedMarkdownContent } from './build-state-from-updated-markdown-content'
import { buildStateFromFirstHeadingUpdate } from './reducers/build-state-from-first-heading-update'
import { buildStateFromMetadataUpdate } from './reducers/build-state-from-metadata-update'
import { buildStateFromServerPermissions } from './reducers/build-state-from-server-permissions'
import { buildStateFromServerDto } from './reducers/build-state-from-set-note-data-from-server'
import { buildStateFromUpdateCursorPosition } from './reducers/build-state-from-update-cursor-position'
import type { NoteDetailsActions } from './types'
import { NoteDetailsActionType } from './types'
import type { OptionalNoteDetails } from './types/note-details'
import type { Reducer } from 'redux'

export const NoteDetailsReducer: Reducer<OptionalNoteDetails, NoteDetailsActions> = (
  state: OptionalNoteDetails = null,
  action: NoteDetailsActions
) => {
  if (action.type === NoteDetailsActionType.SET_NOTE_DATA_FROM_SERVER) {
    return buildStateFromServerDto(action.noteFromServer)
  }
  if (state === null) {
    return null
  }
  switch (action.type) {
    case NoteDetailsActionType.UPDATE_CURSOR_POSITION:
      return buildStateFromUpdateCursorPosition(state, action.selection)
    case NoteDetailsActionType.SET_DOCUMENT_CONTENT:
      return buildStateFromUpdatedMarkdownContent(state, action.content)
    case NoteDetailsActionType.SET_NOTE_PERMISSIONS_FROM_SERVER:
      return buildStateFromServerPermissions(state, action.notePermissionsFromServer)
    case NoteDetailsActionType.UPDATE_NOTE_TITLE_BY_FIRST_HEADING:
      return buildStateFromFirstHeadingUpdate(state, action.firstHeading)
    case NoteDetailsActionType.UPDATE_METADATA:
      return buildStateFromMetadataUpdate(state, action.updatedMetadata)
    case NoteDetailsActionType.UNLOAD_NOTE:
      return null
    default:
      return state
  }
}
