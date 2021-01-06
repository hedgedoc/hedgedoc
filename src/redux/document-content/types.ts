/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Action } from 'redux'
import { YAMLMetaData } from '../../components/editor/yaml-metadata/yaml-metadata'

export enum DocumentContentActionType {
  SET_DOCUMENT_CONTENT = 'document-content/set',
  SET_NOTE_ID = 'document-content/noteid/set',
  SET_DOCUMENT_METADATA = 'document-content/metadata/set'
}

export interface DocumentContent {
  content: string
  noteId: string,
  metadata: YAMLMetaData
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

export interface SetDocumentMetadataAction extends DocumentContentAction {
  metadata: YAMLMetaData
}
