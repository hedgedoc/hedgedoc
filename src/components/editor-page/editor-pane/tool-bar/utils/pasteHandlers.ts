/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { convertClipboardTableToMarkdown, isTable } from '../../table-extractor'
import { handleUpload } from '../../upload-handler'
import { replaceSelection } from '../../../../../redux/note-details/methods'
import { isCursorInCodeFence } from './codefenceDetection'
import { getGlobalState } from '../../../../../redux'
import Optional from 'optional-js'

type ClipboardDataFormats = 'text' | 'url' | 'text/plain' | 'text/uri-list' | 'text/html'

export interface PasteEvent {
  clipboardData: {
    files: FileList
    getData: (format: ClipboardDataFormats) => string
  }
  preventDefault: () => void
}

/**
 * Checks if the given {@link PasteEvent paste event} contains a text formatted table
 * and inserts it into the markdown content.
 * This happens only if smart paste was activated.
 *
 * @param event The {@link PasteEvent} from the browser
 * @return {@code true} if the event was processed. {@code false} otherwise
 */
export const handleTablePaste = (event: PasteEvent): boolean => {
  if (!getGlobalState().editorConfig.smartPaste || isCursorInCodeFence()) {
    return false
  }

  return Optional.ofNullable(event.clipboardData.getData('text'))
    .filter((pasteText) => !!pasteText && isTable(pasteText))
    .map((pasteText) => convertClipboardTableToMarkdown(pasteText))
    .map((markdownTable) => {
      replaceSelection(markdownTable)
      return true
    })
    .orElse(false)
}

/**
 * Checks if the given {@link PasteEvent paste event} contains files and uploads them.
 *
 * @param event The {@link PasteEvent} from the browser
 * @return {@code true} if the event was processed. {@code false} otherwise
 */
export const handleFilePaste = (event: PasteEvent): boolean => {
  return Optional.ofNullable(event.clipboardData.files)
    .filter((files) => !!files && files.length > 0)
    .map((files) => {
      handleUpload(files[0])
      return true
    })
    .orElse(false)
}
