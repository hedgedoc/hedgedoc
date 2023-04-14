/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useRendererToEditorCommunicator } from '../../../../components/editor-page/render-context/renderer-to-editor-communicator-context-provider'
import { CommunicationMessageType } from '../../../../components/render-page/window-post-message-communicator/rendering-message'
import { Logger } from '../../../../utils/logger'
import { FileContentFormat, readFile } from '../../../../utils/read-file'
import { useCallback } from 'react'

const log = new Logger('useOnImageUpload')

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
      readFile(file, FileContentFormat.DATA_URL)
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
