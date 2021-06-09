/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Editor } from 'codemirror'
import React, { Fragment, useCallback, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { UploadInput } from '../../sidebar/upload-input'
import { handleUpload } from '../upload-handler'
import { supportedMimeTypes } from '../../../common/upload-image-mimetypes'

export interface UploadImageButtonProps {
  editor?: Editor
}

const acceptedMimeTypes = supportedMimeTypes.join(', ')

export const UploadImageButton: React.FC<UploadImageButtonProps> = ({ editor }) => {
  const { t } = useTranslation()
  const clickRef = useRef<() => void>()
  const buttonClick = useCallback(() => {
    clickRef.current?.()
  }, [])

  const onUploadImage = useCallback(
    (file: File) => {
      if (editor) {
        handleUpload(file, editor)
      }
      return Promise.resolve()
    },
    [editor]
  )

  if (!editor) {
    return null
  }

  return (
    <Fragment>
      <Button variant='light' onClick={buttonClick} title={t('editor.editorToolbar.uploadImage')}>
        <ForkAwesomeIcon icon={'upload'} />
      </Button>
      <UploadInput onLoad={onUploadImage} acceptedFiles={acceptedMimeTypes} onClickRef={clickRef} />
    </Fragment>
  )
}
