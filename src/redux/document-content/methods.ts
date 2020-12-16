/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import { DocumentContentActionType, SetDocumentContentAction, SetNoteIdAction } from './types'

export const setDocumentContent = (content: string): void => {
  const action: SetDocumentContentAction = {
    type: DocumentContentActionType.SET_DOCUMENT_CONTENT,
    content: content
  }
  store.dispatch(action)
}

export const setNoteId = (noteId: string): void => {
  const action: SetNoteIdAction = {
    type: DocumentContentActionType.SET_NOTE_ID,
    noteId: noteId
  }
  store.dispatch(action)
}
