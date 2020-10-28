import { Action } from 'redux'

export enum DocumentContentActionType {
  SET_DOCUMENT_CONTENT = 'document-content/set',
}

export interface DocumentContent {
  content: string
}

export interface DocumentContentAction extends Action<DocumentContentActionType> {
  type: DocumentContentActionType
}

export interface SetDocumentContentAction extends DocumentContentAction {
  content: string
}
