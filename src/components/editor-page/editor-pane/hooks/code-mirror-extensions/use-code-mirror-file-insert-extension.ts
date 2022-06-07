/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { EditorView } from '@codemirror/view'
import type { Extension } from '@codemirror/state'
import { handleUpload } from '../use-handle-upload'
import Optional from 'optional-js'
import type { CursorSelection } from '../../tool-bar/formatters/types/cursor-selection'

const calculateCursorPositionInEditor = (view: EditorView, event: MouseEvent): number => {
  return Optional.ofNullable(event.pageX)
    .flatMap((posX) => {
      return Optional.ofNullable(event.pageY).map((posY) => {
        return view.posAtCoords({ x: posX, y: posY })
      })
    })
    .orElse(view.state.selection.main.head)
}

const processFileList = (view: EditorView, fileList?: FileList, cursorSelection?: CursorSelection): boolean => {
  return Optional.ofNullable(fileList)
    .filter((files) => files.length > 0)
    .map((files) => {
      handleUpload(view, files[0], cursorSelection)
      return true
    })
    .orElse(false)
}

/**
 * Creates a callback that is used to process file drops and pastes on the code mirror editor
 *
 * @return the code mirror callback
 */
export const useCodeMirrorFileInsertExtension = (): Extension => {
  return useMemo(() => {
    return EditorView.domEventHandlers({
      drop: (event, view) => {
        processFileList(view, event.dataTransfer?.files, { from: calculateCursorPositionInEditor(view, event) }) &&
          event.preventDefault()
      },
      paste: (event, view) => {
        processFileList(view, event.clipboardData?.files) && event.preventDefault()
      }
    })
  }, [])
}
