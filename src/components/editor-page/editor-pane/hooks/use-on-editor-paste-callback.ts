/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react'
import type { Editor } from 'codemirror'
import type { PasteEvent } from '../tool-bar/utils/pasteHandlers'
import { handleFilePaste, handleTablePaste } from '../tool-bar/utils/pasteHandlers'
import type { DomEvent } from 'react-codemirror2'

/**
 * Creates a callback that handles the table or file paste action in code mirror.
 *
 * @return the created callback
 */
export const useOnEditorPasteCallback = (): DomEvent => {
  return useCallback((pasteEditor: Editor, event: PasteEvent) => {
    if (!event || !event.clipboardData) {
      return
    }
    if (handleTablePaste(event) || handleFilePaste(event)) {
      event.preventDefault()
      return
    }
  }, [])
}
