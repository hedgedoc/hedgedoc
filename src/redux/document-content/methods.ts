import { store } from '..'
import { DocumentContentActionType, SetDocumentContentAction } from './types'

export const setDocumentContent = (content: string): void => {
  const action: SetDocumentContentAction = {
    type: DocumentContentActionType.SET_DOCUMENT_CONTENT,
    content: content
  }
  store.dispatch(action)
}
