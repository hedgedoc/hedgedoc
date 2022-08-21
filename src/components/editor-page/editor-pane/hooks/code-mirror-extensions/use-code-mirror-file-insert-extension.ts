/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { EditorView } from '@codemirror/view'
import type { Extension } from '@codemirror/state'
import { handleUpload } from '../use-handle-upload'
import { Optional } from '@mrdrogdrog/optional'

const calculateCursorPositionInEditor = (view: EditorView, event: MouseEvent): number => {
  return Optional.ofNullable(event.pageX)
    .flatMap((posX) => {
      return Optional.ofNullable(event.pageY).map((posY) => {
        return view.posAtCoords({ x: posX, y: posY })
      })
    })
    .orElse(view.state.selection.main.head)
}

const extractFirstFile = (fileList?: FileList): Optional<File> => {
  return Optional.ofNullable(fileList)
    .filter((files) => files.length > 0)
    .map((files) => files[0])
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
        extractFirstFile(event.dataTransfer?.files).ifPresent((file) => {
          handleUpload(view, file, { from: calculateCursorPositionInEditor(view, event) })
          event.preventDefault()
        })
      },
      paste: (event, view) => {
        extractFirstFile(event.clipboardData?.files).ifPresent((file) => {
          handleUpload(view, file)
          event.preventDefault()
        })
      }
    })
  }, [])
}
