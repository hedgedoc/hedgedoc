/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import type { Note, NotePermissions } from '../../api/notes/types'
import type {
  SetNoteDetailsFromServerAction,
  SetNoteDocumentContentAction,
  SetNotePermissionsFromServerAction,
  UpdateCursorPositionAction,
  UpdateMetadataAction,
  UpdateNoteTitleByFirstHeadingAction
} from './types'
import { NoteDetailsActionType } from './types'
import type { CursorSelection } from '../../components/editor-page/editor-pane/tool-bar/formatters/types/cursor-selection'
import { getNoteMetadata } from '../../api/notes'

/**
 * Sets the content of the current note, extracts and parses the frontmatter and extracts the markdown content part.
 * @param content The note content as it is written inside the editor pane.
 */
export const setNoteContent = (content: string): void => {
  store.dispatch({
    type: NoteDetailsActionType.SET_DOCUMENT_CONTENT,
    content: content
  } as SetNoteDocumentContentAction)
}

/**
 * Sets the note metadata for the current note from an API response DTO to the redux.
 * @param apiResponse The NoteDTO received from the API to store into redux.
 */
export const setNoteDataFromServer = (apiResponse: Note): void => {
  store.dispatch({
    type: NoteDetailsActionType.SET_NOTE_DATA_FROM_SERVER,
    noteFromServer: apiResponse
  } as SetNoteDetailsFromServerAction)
}

/**
 * Sets the note permissions for the current note from an API response DTO to the redux.
 * @param apiResponse The NotePermissionsDTO received from the API to store into redux.
 */
export const setNotePermissionsFromServer = (apiResponse: NotePermissions): void => {
  store.dispatch({
    type: NoteDetailsActionType.SET_NOTE_PERMISSIONS_FROM_SERVER,
    notePermissionsFromServer: apiResponse
  } as SetNotePermissionsFromServerAction)
}

/**
 * Updates the note title in the redux by the first heading found in the markdown content.
 * @param firstHeading The content of the first heading found in the markdown content.
 */
export const updateNoteTitleByFirstHeading = (firstHeading?: string): void => {
  store.dispatch({
    type: NoteDetailsActionType.UPDATE_NOTE_TITLE_BY_FIRST_HEADING,
    firstHeading: firstHeading
  } as UpdateNoteTitleByFirstHeadingAction)
}

export const updateCursorPositions = (selection: CursorSelection): void => {
  store.dispatch({
    type: NoteDetailsActionType.UPDATE_CURSOR_POSITION,
    selection
  } as UpdateCursorPositionAction)
}

/**
 * Updates the current note's metadata from the server.
 */
export const updateMetadata = async (): Promise<void> => {
  const updatedMetadata = await getNoteMetadata(store.getState().noteDetails.id)
  store.dispatch({
    type: NoteDetailsActionType.UPDATE_METADATA,
    updatedMetadata
  } as UpdateMetadataAction)
}
