/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Action } from 'redux'

export enum DocumentContentActionType {
  SET_DOCUMENT_CONTENT = 'document-content/set',
  SET_NOTE_ID = 'document-content/noteid/set'
}

export interface DocumentContent {
  content: string
  noteId: string
}

export interface DocumentContentAction extends Action<DocumentContentActionType> {
  type: DocumentContentActionType
}

export interface SetDocumentContentAction extends DocumentContentAction {
  content: string
}

export interface SetNoteIdAction extends DocumentContentAction {
  noteId: string
}
