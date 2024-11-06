/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { uploadFile } from '../../../../api/media'
import { getGlobalState } from '../../../../redux'
import { supportedMimeTypes } from '../../../common/upload-image-mimetypes'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import type { ContentFormatter } from '../../change-content-context/use-change-editor-content-callback'
import { changeEditorContent } from '../../change-content-context/use-change-editor-content-callback'
import { replaceInContent } from '../tool-bar/formatters/replace-in-content'
import { replaceSelection } from '../tool-bar/formatters/replace-selection'
import type { CursorSelection } from '../tool-bar/formatters/types/cursor-selection'
import type { EditorView } from '@codemirror/view'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBaseUrl } from '../../../../hooks/common/use-base-url'
import type { ApiError } from 'next/dist/server/api-utils'

/**
 * @param view the codemirror instance that is used to insert the Markdown code
 * @param file The file to upload
 * @param cursorSelection The position where the progress message should be placed
 * @param description The text that should be used in the description part of the resulting image tag
 * @param additionalUrlText Additional text that should be inserted behind the link but within the tag
 */
type handleUploadSignature = (
  view: EditorView,
  file: File,
  cursorSelection?: CursorSelection,
  description?: string,
  additionalUrlText?: string
) => void

/**
 * Provides a callback that uploads a given file and inserts the correct Markdown code into the current editor.
 */
export const useHandleUpload = (): handleUploadSignature => {
  const { t } = useTranslation()
  const { showErrorNotification } = useUiNotifications()
  const baseUrl = useBaseUrl()

  return useCallback(
    (view, file, cursorSelection, description, additionalUrlText) => {
      const changeContent = (callback: ContentFormatter) => changeEditorContent(view, callback)
      if (!file || !supportedMimeTypes.includes(file.type) || !changeContent) {
        return
      }
      const randomId = Math.random().toString(36).slice(7)
      const uploadFileInfo = description
        ? t('editor.upload.uploadFile.withDescription', { fileName: file.name, description: description })
        : t('editor.upload.uploadFile.withoutDescription', { fileName: file.name })

      const uploadPlaceholder = `![${uploadFileInfo}](upload-${randomId}${additionalUrlText ?? ''})`
      const noteId = getGlobalState().noteDetails?.id
      if (noteId === undefined) {
        return
      }
      changeContent(({ currentSelection }) => {
        return replaceSelection(cursorSelection ?? currentSelection, uploadPlaceholder, false)
      })
      uploadFile(noteId, file)
        .then(({ uuid }) => {
          const fullUrl = `${baseUrl}media/${uuid}`
          const replacement = `![${description ?? file.name ?? ''}](${fullUrl}${additionalUrlText ?? ''})`
          changeContent(({ markdownContent }) => [
            replaceInContent(markdownContent, uploadPlaceholder, replacement),
            undefined
          ])
        })
        .catch((error: ApiError) => {
          if (error.statusCode === 413) {
            showErrorNotification('editor.upload.failed_size_too_large', { fileName: file.name })(error)
          } else {
            showErrorNotification('editor.upload.failed', { fileName: file.name })(error)
          }
          changeContent(({ markdownContent }) => [
            replaceInContent(markdownContent, uploadPlaceholder, '\n'),
            undefined
          ])
        })
    },
    [showErrorNotification, t, baseUrl]
  )
}
