/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import { YAMLMetaData } from '../../components/editor/yaml-metadata/yaml-metadata'
import { initialState } from './reducers'
import {
  DocumentContentActionType,
  SetDocumentContentAction,
  SetDocumentMetadataAction,
  SetNoteIdAction
} from './types'

export const setDocumentContent = (content: string): void => {
  const action: SetDocumentContentAction = {
    type: DocumentContentActionType.SET_DOCUMENT_CONTENT,
    content
  }
  store.dispatch(action)
}

export const setNoteId = (noteId: string): void => {
  const action: SetNoteIdAction = {
    type: DocumentContentActionType.SET_NOTE_ID,
    noteId
  }
  store.dispatch(action)
}

export const setDocumentMetadata = (metadata: YAMLMetaData | undefined): void => {
  if (!metadata) {
    metadata = initialState.metadata
  }
  const action: SetDocumentMetadataAction = {
    type: DocumentContentActionType.SET_DOCUMENT_METADATA,
    metadata
  }
  store.dispatch(action)
}
