/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import type { NoteDto } from '../../api/notes/types'
import type {
  AddTableAtCursorAction,
  FormatSelectionAction,
  FormatType,
  InsertTextAtCursorAction,
  ReplaceInMarkdownContentAction,
  SetNoteDetailsFromServerAction,
  SetNoteDocumentContentAction,
  UpdateCursorPositionAction,
  UpdateNoteTitleByFirstHeadingAction,
  UpdateTaskListCheckboxAction
} from './types'
import { NoteDetailsActionType } from './types'
import type { CursorPosition, CursorSelection } from '../editor/types'

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
 *
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

/**
 * Replaces a string in the markdown content in the global application state.
 *
 * @param replaceable The string that should be replaced
 * @param replacement The replacement for the replaceable
 */
export const replaceInMarkdownContent = (replaceable: string, replacement: string): void => {
  store.dispatch({
    type: NoteDetailsActionType.REPLACE_IN_MARKDOWN_CONTENT,
    placeholder: replaceable,
    replacement
  } as ReplaceInMarkdownContentAction)
}

export const updateCursorPositions = (selection: CursorSelection): void => {
  const correctedSelection: CursorSelection = isFromAfterTo(selection)
    ? {
        to: selection.from,
        from: selection.to as CursorPosition
      }
    : selection

  store.dispatch({
    type: NoteDetailsActionType.UPDATE_CURSOR_POSITION,
    selection: correctedSelection
  } as UpdateCursorPositionAction)
}

/**
 * Checks if the from cursor position in the given selection is after the to cursor position.
 *
 * @param selection The cursor selection to check
 * @return {@code true} if the from cursor position is after the to position
 */
const isFromAfterTo = (selection: CursorSelection): boolean => {
  if (selection.to === undefined) {
    return false
  }
  if (selection.from.line < selection.to.line) {
    return false
  }
  return selection.from.line !== selection.to.line || selection.from.character > selection.to.character
}

export const formatSelection = (formatType: FormatType): void => {
  store.dispatch({
    type: NoteDetailsActionType.FORMAT_SELECTION,
    formatType
  } as FormatSelectionAction)
}

export const addTableAtCursor = (rows: number, columns: number): void => {
  store.dispatch({
    type: NoteDetailsActionType.ADD_TABLE_AT_CURSOR,
    rows,
    columns
  } as AddTableAtCursorAction)
}

export const replaceSelection = (text: string, cursorSelection?: CursorSelection): void => {
  store.dispatch({
    type: NoteDetailsActionType.REPLACE_SELECTION,
    text,
    cursorSelection
  } as InsertTextAtCursorAction)
}
