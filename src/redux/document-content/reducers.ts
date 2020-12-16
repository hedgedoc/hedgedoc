/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Reducer } from 'redux'
import {
  DocumentContent,
  DocumentContentAction,
  DocumentContentActionType,
  SetDocumentContentAction,
  SetNoteIdAction
} from './types'

export const initialState: DocumentContent = {
  content: '',
  noteId: ''
}

export const DocumentContentReducer: Reducer<DocumentContent, DocumentContentAction> = (state: DocumentContent = initialState, action: DocumentContentAction) => {
  switch (action.type) {
    case DocumentContentActionType.SET_DOCUMENT_CONTENT:
      return {
        ...state,
        content: (action as SetDocumentContentAction).content
      }
    case DocumentContentActionType.SET_NOTE_ID:
      return {
        ...state,
        noteId: (action as SetNoteIdAction).noteId
      }
    default:
      return state
  }
}
