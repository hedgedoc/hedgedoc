/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import type { NoteDto } from '../../api/notes/types'
import type {
  SetNoteDetailsFromServerAction,
  SetNoteDocumentContentAction,
  UpdateNoteTitleByFirstHeadingAction,
  UpdateTaskListCheckboxAction
} from './types'
import { NoteDetailsActionType } from './types'

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
export const setNoteDataFromServer = (apiResponse: NoteDto): void => {
  store.dispatch({
    type: NoteDetailsActionType.SET_NOTE_DATA_FROM_SERVER,
    dto: apiResponse
  } as SetNoteDetailsFromServerAction)
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

/**
 * Changes a checkbox state in the note document content. Triggered when a checkbox in the rendering is clicked.
 * @param lineInDocumentContent The line in the document content to change.
 * @param checked true if the checkbox is checked, false otherwise.
 */
export const setCheckboxInMarkdownContent = (lineInDocumentContent: number, checked: boolean): void => {
  store.dispatch({
    type: NoteDetailsActionType.UPDATE_TASK_LIST_CHECKBOX,
    checkboxChecked: checked,
    changedLine: lineInDocumentContent
  } as UpdateTaskListCheckboxAction)
}
