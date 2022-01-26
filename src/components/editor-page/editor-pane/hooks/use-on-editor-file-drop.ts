/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react'
import type { Editor } from 'codemirror'
import { handleUpload } from '../upload-handler'
import type { DomEvent } from 'react-codemirror2'

interface DropEvent {
  pageX: number
  pageY: number
  dataTransfer: {
    files: FileList
    effectAllowed: string
  } | null
  preventDefault: () => void
}

/**
 * Creates a callback that is used to process file drops on the code mirror editor
 *
 * @return the code mirror callback
 */
export const useOnEditorFileDrop = (): DomEvent => {
  return useCallback((dropEditor: Editor, event: DropEvent) => {
    if (
      event &&
      dropEditor &&
      event.pageX &&
      event.pageY &&
      event.dataTransfer &&
      event.dataTransfer.files &&
      event.dataTransfer.files.length >= 1
    ) {
      event.preventDefault()
      const newCursor = dropEditor.coordsChar({ top: event.pageY, left: event.pageX }, 'page')
      dropEditor.setCursor(newCursor)
      const files: FileList = event.dataTransfer.files
      handleUpload(files[0])
    }
  }, [])
}
