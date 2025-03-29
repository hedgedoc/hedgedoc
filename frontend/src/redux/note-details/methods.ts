/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import { getNoteMetadata } from '../../api/notes'
import type { CursorSelection } from '../../components/editor-page/editor-pane/tool-bar/formatters/types/cursor-selection'
import type { NoteDto, NotePermissionsDto } from '@hedgedoc/commons'
import { noteDetailsActionsCreator } from './slice'

/**
 * Sets the content of the current note, extracts and parses the frontmatter and extracts the markdown content part.
 * @param content The note content as it is written inside the editor pane.
 */
export const setNoteContent = (content: string): void => {
  const action = noteDetailsActionsCreator.setNoteContent(content)
  store.dispatch(action)
}

/**
 * Sets the note metadata for the current note from an API response DTO to the redux.
 * @param apiResponse The NoteDTO received from the API to store into redux.
 */
export const setNoteDataFromServer = (apiResponse: NoteDto): void => {
  const action = noteDetailsActionsCreator.setNoteDataFromServer(apiResponse)
  store.dispatch(action)
}

/**
 * Sets the note permissions for the current note from an API response DTO to the redux.
 * @param apiResponse The NotePermissionsDTO received from the API to store into redux.
 */
export const setNotePermissionsFromServer = (apiResponse: NotePermissionsDto): void => {
  const action = noteDetailsActionsCreator.setNotePermissionsFromServer(apiResponse)
  store.dispatch(action)
}

/**
 * Updates the note title in the redux by the first heading found in the markdown content.
 * @param firstHeading The content of the first heading found in the markdown content.
 */
export const updateNoteTitleByFirstHeading = (firstHeading?: string): void => {
  const action = noteDetailsActionsCreator.updateNoteTitleByFirstHeading(firstHeading)
  store.dispatch(action)
}

export const updateCursorPositions = (selection: CursorSelection): void => {
  const action = noteDetailsActionsCreator.updateCursorPosition(selection)
  store.dispatch(action)
}

/**
 * Updates the current note's metadata from the server.
 */
export const updateMetadata = async (): Promise<void> => {
  const noteDetails = store.getState().noteDetails
  if (!noteDetails) {
    return
  }
  const updatedMetadata = await getNoteMetadata(noteDetails.id)
  const action = noteDetailsActionsCreator.updateMetadata(updatedMetadata)
  store.dispatch(action)
}

export const unloadNote = (): void => {
  const action = noteDetailsActionsCreator.unloadNote()
  store.dispatch(action)
}
