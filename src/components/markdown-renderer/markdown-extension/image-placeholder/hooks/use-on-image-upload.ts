/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useRendererToEditorCommunicator } from '../../../../editor-page/render-context/renderer-to-editor-communicator-context-provider'
import { useCallback } from 'react'
import { CommunicationMessageType } from '../../../../render-page/window-post-message-communicator/rendering-message'
import { Logger } from '../../../../../utils/logger'

const log = new Logger('useOnImageUpload')

/**
 * Converts a {@link File} to a data url.
 *
 * @param file The file to convert
 * @return The file content represented as data url
 */
const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Provides a callback that sends a {@link File file} to the editor via iframe communication.
 *
 * @param lineIndex The index of the line in the markdown content where the placeholder is defined
 * @param placeholderIndexInLine The index of the placeholder in the markdown content line
 */
export const useOnImageUpload = (
  lineIndex: number | undefined,
  placeholderIndexInLine: number | undefined
): ((file: File) => void) => {
  const communicator = useRendererToEditorCommunicator()

  return useCallback(
    (file: File) => {
      readFileAsDataUrl(file)
        .then((dataUri) => {
          communicator.sendMessageToOtherSide({
            type: CommunicationMessageType.IMAGE_UPLOAD,
            dataUri,
            fileName: file.name,
            lineIndex,
            placeholderIndexInLine
          })
        })
        .catch((error: ProgressEvent) => log.error('Error while uploading image', error))
    },
    [communicator, placeholderIndexInLine, lineIndex]
  )
}
