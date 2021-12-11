/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action } from 'redux'
import type { NoteDto } from '../../api/notes/types'

export enum NoteDetailsActionType {
  SET_DOCUMENT_CONTENT = 'note-details/content/set',
  SET_NOTE_DATA_FROM_SERVER = 'note-details/data/server/set',
  UPDATE_NOTE_TITLE_BY_FIRST_HEADING = 'note-details/update-note-title-by-first-heading',
  UPDATE_TASK_LIST_CHECKBOX = 'note-details/update-task-list-checkbox',
  REPLACE_IN_MARKDOWN_CONTENT = 'note-details/replace-in-markdown-content'
}

export type NoteDetailsActions =
  | SetNoteDocumentContentAction
  | SetNoteDetailsFromServerAction
  | UpdateNoteTitleByFirstHeadingAction
  | UpdateTaskListCheckboxAction
  | ReplaceInMarkdownContentAction

/**
 * Action for updating the document content of the currently loaded note.
 */
export interface SetNoteDocumentContentAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.SET_DOCUMENT_CONTENT
  content: string
}

/**
 * Action for overwriting the current state with the data received from the API.
 */
export interface SetNoteDetailsFromServerAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.SET_NOTE_DATA_FROM_SERVER
  dto: NoteDto
}

/**
 * Action for updating the note title of the currently loaded note by using frontmatter data or the first heading.
 */
export interface UpdateNoteTitleByFirstHeadingAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.UPDATE_NOTE_TITLE_BY_FIRST_HEADING
  firstHeading?: string
}

/**
 * Action for manipulating the document content of the currently loaded note by changing the checked state of a task list checkbox.
 */
export interface UpdateTaskListCheckboxAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.UPDATE_TASK_LIST_CHECKBOX
  changedLine: number
  checkboxChecked: boolean
}

export interface ReplaceInMarkdownContentAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.REPLACE_IN_MARKDOWN_CONTENT
  placeholder: string
  replacement: string
}
