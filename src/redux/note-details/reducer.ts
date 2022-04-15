/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Reducer } from 'redux'
import type { NoteDetailsActions } from './types'
import { NoteDetailsActionType } from './types'
import { initialState } from './initial-state'
import type { NoteDetails } from './types/note-details'
import { buildStateFromUpdatedMarkdownContent } from './build-state-from-updated-markdown-content'
import { buildStateFromUpdateCursorPosition } from './reducers/build-state-from-update-cursor-position'
import { buildStateFromFirstHeadingUpdate } from './reducers/build-state-from-first-heading-update'
import { buildStateFromServerDto } from './reducers/build-state-from-set-note-data-from-server'
import { buildStateFromAddTableAtCursor } from './reducers/build-state-from-add-table-at-cursor'
import { buildStateFromReplaceSelection } from './reducers/build-state-from-replace-selection'
import { buildStateFromTaskListUpdate } from './reducers/build-state-from-task-list-update'
import { buildStateFromSelectionFormat } from './reducers/build-state-from-selection-format'
import { buildStateFromReplaceInMarkdownContent } from './reducers/build-state-from-replace-in-markdown-content'
import { buildStateFromServerPermissions } from './reducers/build-state-from-server-permissions'

export const NoteDetailsReducer: Reducer<NoteDetails, NoteDetailsActions> = (
  state: NoteDetails = initialState,
  action: NoteDetailsActions
) => {
  switch (action.type) {
    case NoteDetailsActionType.UPDATE_CURSOR_POSITION:
      return buildStateFromUpdateCursorPosition(state, action.selection)
    case NoteDetailsActionType.SET_DOCUMENT_CONTENT:
      return buildStateFromUpdatedMarkdownContent(state, action.content)
    case NoteDetailsActionType.SET_NOTE_PERMISSIONS_FROM_SERVER:
      return buildStateFromServerPermissions(state, action.notePermissionsFromServer)
    case NoteDetailsActionType.UPDATE_NOTE_TITLE_BY_FIRST_HEADING:
      return buildStateFromFirstHeadingUpdate(state, action.firstHeading)
    case NoteDetailsActionType.SET_NOTE_DATA_FROM_SERVER:
      return buildStateFromServerDto(action.noteFromServer)
    case NoteDetailsActionType.UPDATE_TASK_LIST_CHECKBOX:
      return buildStateFromTaskListUpdate(state, action.changedLine, action.checkboxChecked)
    case NoteDetailsActionType.REPLACE_IN_MARKDOWN_CONTENT:
      return buildStateFromReplaceInMarkdownContent(state, action.placeholder, action.replacement)
    case NoteDetailsActionType.FORMAT_SELECTION:
      return buildStateFromSelectionFormat(state, action.formatType)
    case NoteDetailsActionType.ADD_TABLE_AT_CURSOR:
      return buildStateFromAddTableAtCursor(state, action.rows, action.columns)
    case NoteDetailsActionType.REPLACE_SELECTION:
      return buildStateFromReplaceSelection(state, action.text, action.cursorSelection)
    default:
      return state
  }
}
