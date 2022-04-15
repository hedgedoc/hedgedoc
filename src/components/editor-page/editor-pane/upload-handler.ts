/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { uploadFile } from '../../../api/media'
import { getGlobalState } from '../../../redux'
import { supportedMimeTypes } from '../../common/upload-image-mimetypes'
import { replaceInMarkdownContent, replaceSelection } from '../../../redux/note-details/methods'
import { t } from 'i18next'
import { showErrorNotification } from '../../../redux/ui-notifications/methods'
import type { CursorSelection } from '../../../redux/editor/types'

/**
 * Uploads the given file and writes the progress into the given editor at the given cursor positions.
 *
 * @param file The file to upload
 * @param cursorSelection The position where the progress message should be placed
 * @param description The text that should be used in the description part of the resulting image tag
 * @param additionalUrlText Additional text that should be inserted behind the link but within the tag
 */
export const handleUpload = (
  file: File,
  cursorSelection?: CursorSelection,
  description?: string,
  additionalUrlText?: string
): void => {
  if (!file) {
    return
  }
  if (!supportedMimeTypes.includes(file.type)) {
    return
  }
  const randomId = Math.random().toString(36).slice(7)
  const uploadFileInfo = description
    ? t('editor.upload.uploadFile.withDescription', { fileName: file.name, description: description })
    : t('editor.upload.uploadFile.withoutDescription', { fileName: file.name })

  const uploadPlaceholder = `![${uploadFileInfo}](upload-${randomId}${additionalUrlText ?? ''})`
  const noteId = getGlobalState().noteDetails.id

  replaceSelection(uploadPlaceholder, cursorSelection)
  uploadFile(noteId, file)
    .then(({ url }) => {
      replaceInMarkdownContent(uploadPlaceholder, `![${description ?? ''}](${url}${additionalUrlText ?? ''})`)
    })
    .catch((error: Error) => {
      showErrorNotification('editor.upload.failed', { fileName: file.name })(error)
      replaceInMarkdownContent(uploadPlaceholder, `![upload of ${file.name} failed]()`)
    })
}
