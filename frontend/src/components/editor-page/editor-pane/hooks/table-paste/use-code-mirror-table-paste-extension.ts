/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { EditorView } from '@codemirror/view'
import type { Extension } from '@codemirror/state'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { changeEditorContent } from '../../../change-content-context/use-change-editor-content-callback'
import { Optional } from '@mrdrogdrog/optional'
import { replaceSelection } from '../../tool-bar/formatters/replace-selection'
import { convertClipboardTableToMarkdown, isTable } from './table-extractor'
import { isCursorInCodeFence } from './codefenceDetection'

/**
 * Creates a {@link Extension code mirror extension} that handles the smart table detection on paste-from-clipboard events.
 *
 * @return the created {@link Extension code mirror extension}
 */
export const useCodeMirrorTablePasteExtension = (): Extension[] => {
  const smartPaste = useApplicationState((state) => state.editorConfig.smartPaste)

  return useMemo(() => {
    return smartPaste
      ? [
          EditorView.domEventHandlers({
            paste: (event, view) => {
              if (isCursorInCodeFence(view.state.doc.toString(), view.state.selection.main.from)) {
                return
              }
              Optional.ofNullable(event.clipboardData)
                .map((clipboardData) => clipboardData.getData('text'))
                .filter(isTable)
                .map(convertClipboardTableToMarkdown)
                .ifPresent((markdownTable) => {
                  changeEditorContent(view, ({ currentSelection }) => replaceSelection(currentSelection, markdownTable))
                })
            }
          })
        ]
      : []
  }, [smartPaste])
}
