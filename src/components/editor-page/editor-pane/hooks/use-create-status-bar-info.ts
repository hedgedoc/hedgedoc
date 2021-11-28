/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { StatusBarInfo } from '../status-bar/status-bar'
import { defaultState } from '../status-bar/status-bar'
import type { Editor } from 'codemirror'
import { useCallback, useState } from 'react'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

/**
 * Provides a {@link StatusBarInfo} object and a function that can update this object using a {@link CodeMirror code mirror instance}.
 */
export const useCreateStatusBarInfo = (): [
  statusBarInfo: StatusBarInfo,
  updateStatusBarInfo: (editor: Editor) => void
] => {
  const maxDocumentLength = useApplicationState((state) => state.config.maxDocumentLength)
  const [statusBarInfo, setStatusBarInfo] = useState(defaultState)

  const updateStatusBarInfo = useCallback(
    (editor: Editor): void => {
      setStatusBarInfo({
        position: editor.getCursor(),
        charactersInDocument: editor.getValue().length,
        remainingCharacters: maxDocumentLength - editor.getValue().length,
        linesInDocument: editor.lineCount(),
        selectedColumns: editor.getSelection().length,
        selectedLines: editor.getSelection().split('\n').length
      })
    },
    [maxDocumentLength]
  )

  return [statusBarInfo, updateStatusBarInfo]
}
