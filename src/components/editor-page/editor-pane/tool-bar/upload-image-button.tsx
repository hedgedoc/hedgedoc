/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { UploadInput } from '../../sidebar/upload-input'
import { handleUpload } from '../upload-handler'
import { acceptedMimeTypes } from '../../../common/upload-image-mimetypes'
import { cypressId } from '../../../../utils/cypress-attribute'

export const UploadImageButton: React.FC = () => {
  const { t } = useTranslation()
  const clickRef = useRef<() => void>()
  const buttonClick = useCallback(() => {
    clickRef.current?.()
  }, [])

  const onUploadImage = useCallback((file: File) => {
    handleUpload(file)
    return Promise.resolve()
  }, [])

  return (
    <Fragment>
      <Button
        variant='light'
        onClick={buttonClick}
        title={t('editor.editorToolbar.uploadImage')}
        {...cypressId('editor-toolbar-upload-image-button')}>
        <ForkAwesomeIcon icon={'upload'} />
      </Button>
      <UploadInput
        onLoad={onUploadImage}
        acceptedFiles={acceptedMimeTypes}
        onClickRef={clickRef}
        {...cypressId('editor-toolbar-upload-image-input')}
      />
    </Fragment>
  )
}
