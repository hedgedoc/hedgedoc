/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import { Note } from '../../api/notes'
import { NoteFrontmatter } from '../../components/editor-page/note-frontmatter/note-frontmatter'
import { initialState } from './reducers'
import {
  NoteDetailsActionType,
  SetCheckboxInMarkdownContentAction,
  SetNoteDetailsAction,
  SetNoteDetailsFromServerAction,
  SetNoteFrontmatterFromRenderingAction,
  UpdateNoteTitleByFirstHeadingAction
} from './types'

export const setNoteMarkdownContent = (content: string): void => {
  store.dispatch({
    type: NoteDetailsActionType.SET_DOCUMENT_CONTENT,
    content
  } as SetNoteDetailsAction)
}

export const setNoteDataFromServer = (apiResponse: Note): void => {
  store.dispatch({
    type: NoteDetailsActionType.SET_NOTE_DATA_FROM_SERVER,
    note: apiResponse
  } as SetNoteDetailsFromServerAction)
}

export const updateNoteTitleByFirstHeading = (firstHeading?: string): void => {
  store.dispatch({
    type: NoteDetailsActionType.UPDATE_NOTE_TITLE_BY_FIRST_HEADING,
    firstHeading: firstHeading ?? ''
  } as UpdateNoteTitleByFirstHeadingAction)
}

export const setNoteFrontmatter = (frontmatter: NoteFrontmatter | undefined): void => {
  if (!frontmatter) {
    frontmatter = initialState.frontmatter
  }
  store.dispatch({
    type: NoteDetailsActionType.SET_NOTE_FRONTMATTER,
    frontmatter: frontmatter
  } as SetNoteFrontmatterFromRenderingAction)
}

export const SetCheckboxInMarkdownContent = (lineInMarkdown: number, checked: boolean): void => {
  store.dispatch({
    type: NoteDetailsActionType.SET_CHECKBOX_IN_MARKDOWN_CONTENT,
    checked: checked,
    lineInMarkdown: lineInMarkdown
  } as SetCheckboxInMarkdownContentAction)
}
