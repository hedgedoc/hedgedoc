/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import { DocumentContentActionType, SetDocumentContentAction } from './types'

export const setDocumentContent = (content: string): void => {
  const action: SetDocumentContentAction = {
    type: DocumentContentActionType.SET_DOCUMENT_CONTENT,
    content: content
  }
  store.dispatch(action)
}
