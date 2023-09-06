/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Note, NoteMetadata } from '../../api/notes/types'
import type { CursorSelection } from '../../components/editor-page/editor-pane/tool-bar/formatters/types/cursor-selection'
import type { NotePermissions } from '@hedgedoc/commons'
import type { Action } from 'redux'

export enum NoteDetailsActionType {
  SET_DOCUMENT_CONTENT = 'note-details/content/set',
  SET_NOTE_DATA_FROM_SERVER = 'note-details/data/server/set',
  SET_NOTE_PERMISSIONS_FROM_SERVER = 'note-details/data/permissions/set',
  UPDATE_NOTE_TITLE_BY_FIRST_HEADING = 'note-details/update-note-title-by-first-heading',
  UPDATE_CURSOR_POSITION = 'note-details/updateCursorPosition',
  UPDATE_METADATA = 'note-details/update-metadata',
  UNLOAD_NOTE = 'note-details/unload-note'
}

export type NoteDetailsActions =
  | SetNoteDocumentContentAction
  | SetNoteDetailsFromServerAction
  | SetNotePermissionsFromServerAction
  | UpdateNoteTitleByFirstHeadingAction
  | UpdateCursorPositionAction
  | UpdateMetadataAction
  | UnloadNoteAction

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

export interface UpdateCursorPositionAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.UPDATE_CURSOR_POSITION
  selection: CursorSelection
}

/**
 * Action for updating the metadata of the current note.
 */
export interface UpdateMetadataAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.UPDATE_METADATA
  updatedMetadata: NoteMetadata
}

export interface UnloadNoteAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.UNLOAD_NOTE
}
