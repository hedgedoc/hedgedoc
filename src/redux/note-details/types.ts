/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action } from 'redux'
import type { Note, NotePermissions } from '../../api/notes/types'
import type { CursorSelection } from '../editor/types'

export enum NoteDetailsActionType {
  SET_DOCUMENT_CONTENT = 'note-details/content/set',
  SET_NOTE_DATA_FROM_SERVER = 'note-details/data/server/set',
  SET_NOTE_PERMISSIONS_FROM_SERVER = 'note-details/data/permissions/set',
  UPDATE_NOTE_TITLE_BY_FIRST_HEADING = 'note-details/update-note-title-by-first-heading',
  UPDATE_TASK_LIST_CHECKBOX = 'note-details/update-task-list-checkbox',
  UPDATE_CURSOR_POSITION = 'note-details/updateCursorPosition',
  REPLACE_IN_MARKDOWN_CONTENT = 'note-details/replace-in-markdown-content',
  FORMAT_SELECTION = 'note-details/format-selection',
  ADD_TABLE_AT_CURSOR = 'note-details/add-table-at-cursor',
  REPLACE_SELECTION = 'note-details/replace-selection'
}

export enum FormatType {
  BOLD = 'bold',
  ITALIC = 'italic',
  STRIKETHROUGH = 'strikethrough',
  UNDERLINE = 'underline',
  SUBSCRIPT = 'subscript',
  SUPERSCRIPT = 'superscript',
  HIGHLIGHT = 'highlight',
  CODE_FENCE = 'code',
  UNORDERED_LIST = 'unorderedList',
  ORDERED_LIST = 'orderedList',
  CHECK_LIST = 'checkList',
  QUOTES = 'blockquote',
  HORIZONTAL_LINE = 'horizontalLine',
  COMMENT = 'comment',
  COLLAPSIBLE_BLOCK = 'collapsibleBlock',
  HEADER_LEVEL = 'header',
  LINK = 'link',
  IMAGE_LINK = 'imageLink'
}

export type NoteDetailsActions =
  | SetNoteDocumentContentAction
  | SetNoteDetailsFromServerAction
  | SetNotePermissionsFromServerAction
  | UpdateNoteTitleByFirstHeadingAction
  | UpdateTaskListCheckboxAction
  | UpdateCursorPositionAction
  | ReplaceInMarkdownContentAction
  | FormatSelectionAction
  | AddTableAtCursorAction
  | InsertTextAtCursorAction

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
  noteFromServer: Note
}

/**
 * Action for overwriting the current permission state with the data received from the API.
 */
export interface SetNotePermissionsFromServerAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.SET_NOTE_PERMISSIONS_FROM_SERVER
  notePermissionsFromServer: NotePermissions
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

export interface UpdateCursorPositionAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.UPDATE_CURSOR_POSITION
  selection: CursorSelection
}

export interface FormatSelectionAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.FORMAT_SELECTION
  formatType: FormatType
}

export interface AddTableAtCursorAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.ADD_TABLE_AT_CURSOR
  rows: number
  columns: number
}

export interface InsertTextAtCursorAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.REPLACE_SELECTION
  text: string
  cursorSelection?: CursorSelection
}
