/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Editor, Position } from 'codemirror'
import { uploadFile } from '../../../api/media'
import { store } from '../../../redux'
import { supportedMimeTypes } from '../../common/upload-image-mimetypes'
import { replaceInMarkdownContent } from '../../../redux/note-details/methods'
import { t } from 'i18next'
import { showErrorNotification } from '../../../redux/ui-notifications/methods'

/**
 * Uploads the given file and writes the progress into the given editor at the given cursor positions.
 *
 * @param file The file to upload
 * @param editor The editor that should be used to show the progress
 * @param cursorFrom The position where the progress message should be placed
 * @param cursorTo An optional position that should be used to replace content in the editor
 * @param imageDescription The text that should be used in the description part of the resulting image tag
 * @param additionalUrlText Additional text that should be inserted behind the link but within the tag
 */
export const handleUpload = (
  file: File,
  editor: Editor,
  cursorFrom?: Position,
  cursorTo?: Position,
  imageDescription?: string,
  additionalUrlText?: string
): void => {
  if (!file) {
    return
  }
  if (!supportedMimeTypes.includes(file.type)) {
    return
  }
  const randomId = Math.random().toString(36).slice(7)
  const uploadFileInfo =
    imageDescription !== undefined
      ? t('editor.upload.uploadFile.withDescription', { fileName: file.name, description: imageDescription })
      : t('editor.upload.uploadFile.withoutDescription', { fileName: file.name })

  const uploadPlaceholder = `![${uploadFileInfo}](upload-${randomId}${additionalUrlText ?? ''})`
  const noteId = store.getState().noteDetails.id
  const insertCode = (replacement: string) => {
    replaceInMarkdownContent(uploadPlaceholder, replacement)
  }

  editor.replaceRange(uploadPlaceholder, cursorFrom ?? editor.getCursor(), cursorTo, '+input')
  uploadFile(noteId, file)
    .then(({ link }) => {
      insertCode(`![${imageDescription ?? ''}](${link}${additionalUrlText ?? ''})`)
    })
    .catch((error: Error) => {
      showErrorNotification('editor.upload.failed', { fileName: file.name })(error)
      insertCode(`![upload of ${file.name} failed]()`)
    })
}
