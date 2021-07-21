/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'
import { Action } from 'redux'
import { NoteFrontmatter } from '../../components/editor-page/note-frontmatter/note-frontmatter'
import { NoteDto } from '../../api/notes/types'

export enum NoteDetailsActionType {
  SET_DOCUMENT_CONTENT = 'note-details/set',
  SET_NOTE_DATA_FROM_SERVER = 'note-details/data/server/set',
  SET_NOTE_FRONTMATTER = 'note-details/frontmatter/set',
  UPDATE_NOTE_TITLE_BY_FIRST_HEADING = 'note-details/update-note-title-by-first-heading',
  SET_CHECKBOX_IN_MARKDOWN_CONTENT = 'note-details/toggle-checkbox-in-markdown-content'
}

interface LastChange {
  userName: string
  timestamp: DateTime
}

export interface NoteDetails {
  markdownContent: string
  id: string
  createTime: DateTime
  lastChange: LastChange
  viewCount: number
  alias: string
  authorship: string[]
  noteTitle: string
  firstHeading?: string
  frontmatter: NoteFrontmatter
}

export type NoteDetailsActions =
  | SetNoteDetailsAction
  | SetNoteDetailsFromServerAction
  | UpdateNoteTitleByFirstHeadingAction
  | SetNoteFrontmatterFromRenderingAction
  | SetCheckboxInMarkdownContentAction

export interface SetNoteDetailsAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.SET_DOCUMENT_CONTENT
  content: string
}

export interface SetNoteDetailsFromServerAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.SET_NOTE_DATA_FROM_SERVER
  note: NoteDto
}

export interface UpdateNoteTitleByFirstHeadingAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.UPDATE_NOTE_TITLE_BY_FIRST_HEADING
  firstHeading?: string
}

export interface SetNoteFrontmatterFromRenderingAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.SET_NOTE_FRONTMATTER
  frontmatter: NoteFrontmatter
}

export interface SetCheckboxInMarkdownContentAction extends Action<NoteDetailsActionType> {
  type: NoteDetailsActionType.SET_CHECKBOX_IN_MARKDOWN_CONTENT
  lineInMarkdown: number
  checked: boolean
}
