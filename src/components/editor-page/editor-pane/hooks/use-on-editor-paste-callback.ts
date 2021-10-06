/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react'
import { Editor } from 'codemirror'
import { handleFilePaste, handleTablePaste, PasteEvent } from '../tool-bar/utils/pasteHandlers'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { DomEvent } from 'react-codemirror2'

/**
 * Creates a callback that handles the table or file paste action in code mirror.
 *
 * @return the created callback
 */
export const useOnEditorPasteCallback = (): DomEvent => {
  const smartPasteEnabled = useApplicationState((state) => state.editorConfig.smartPaste)

  return useCallback(
    (pasteEditor: Editor, event: PasteEvent) => {
      if (!event || !event.clipboardData) {
        return
      }
      if (smartPasteEnabled && handleTablePaste(event, pasteEditor)) {
        return
      }
      handleFilePaste(event, pasteEditor)
    },
    [smartPasteEnabled]
  )
}
