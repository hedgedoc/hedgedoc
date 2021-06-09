/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Editor } from 'codemirror'
import i18n from 'i18next'
import { uploadFile } from '../../../api/media'
import { store } from '../../../redux'
import { supportedMimeTypes } from '../../common/upload-image-mimetypes'

export const handleUpload = (file: File, editor: Editor): void => {
  if (!file) {
    return
  }
  if (!supportedMimeTypes.includes(file.type)) {
    // this mimetype is not supported
    return
  }
  const cursor = editor.getCursor()
  const uploadPlaceholder = `![${i18n.t('editor.upload.uploadFile', { fileName: file.name })}]()`
  const noteId = store.getState().noteDetails.id
  editor.replaceRange(uploadPlaceholder, cursor, cursor, '+input')
  uploadFile(noteId, file)
    .then(({ link }) => {
      editor.replaceRange(
        `![](${link})`,
        cursor,
        {
          line: cursor.line,
          ch: cursor.ch + uploadPlaceholder.length
        },
        '+input'
      )
    })
    .catch(() => {
      editor.replaceRange(
        '',
        cursor,
        {
          line: cursor.line,
          ch: cursor.ch + uploadPlaceholder.length
        },
        '+input'
      )
    })
}
