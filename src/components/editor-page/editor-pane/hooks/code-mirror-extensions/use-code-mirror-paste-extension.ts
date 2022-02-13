/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { handleFilePaste, handleTablePaste } from '../../tool-bar/utils/pasteHandlers'
import { EditorView } from '@codemirror/view'
import type { Extension } from '@codemirror/state'

/**
 * Creates a {@link Extension code mirror extension} that handles the table or file paste action.
 *
 * @return the created {@link Extension code mirror extension}
 */
export const useCodeMirrorPasteExtension = (): Extension => {
  return useMemo(
    () =>
      EditorView.domEventHandlers({
        paste: (event: ClipboardEvent) => {
          const clipboardData = event.clipboardData
          if (!clipboardData) {
            return
          }
          if (handleTablePaste(clipboardData) || handleFilePaste(clipboardData)) {
            event.preventDefault()
            return
          }
        }
      }),
    []
  )
}
