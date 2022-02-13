/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useMemo } from 'react'
import { handleUpload } from '../../upload-handler'
import { EditorView } from '@codemirror/view'
import type { Extension } from '@codemirror/state'
import Optional from 'optional-js'

/**
 * Creates a callback that is used to process file drops on the code mirror editor
 *
 * @return the code mirror callback
 */
export const useCodeMirrorFileDropExtension = (): Extension => {
  const onDrop = useCallback((event: DragEvent, view: EditorView): void => {
    if (!event.pageX || !event.pageY) {
      return
    }
    Optional.ofNullable(event.dataTransfer?.files)
      .filter((files) => files.length > 0)
      .ifPresent((files) => {
        event.preventDefault()
        const newCursor = view.posAtCoords({ y: event.pageY, x: event.pageX })
        if (newCursor === null) {
          return
        }
        handleUpload(files[0], { from: newCursor })
      })
  }, [])

  return useMemo(
    () =>
      EditorView.domEventHandlers({
        drop: onDrop
      }),
    [onDrop]
  )
}
