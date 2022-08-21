/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'
import { UploadInput } from '../../../sidebar/upload-input'
import { acceptedMimeTypes } from '../../../../common/upload-image-mimetypes'
import { cypressId } from '../../../../../utils/cypress-attribute'
import { useHandleUpload } from '../../hooks/use-handle-upload'
import { ShowIf } from '../../../../common/show-if/show-if'
import { useCodeMirrorReference } from '../../../change-content-context/change-content-context'
import { extractSelectedText } from './extract-selected-text'
import { Optional } from '@mrdrogdrog/optional'
import { Logger } from '../../../../../utils/logger'

const logger = new Logger('Upload image button')

/**
 * Shows a button that uploads a chosen file to the backend and adds the link to the note.
 */
export const UploadImageButton: React.FC = () => {
  const { t } = useTranslation()
  const clickRef = useRef<() => void>()
  const buttonClick = useCallback(() => {
    clickRef.current?.()
  }, [])

  const codeMirror = useCodeMirrorReference()
  const handleUpload = useHandleUpload()

  const onUploadImage = useCallback(
    (file: File) => {
      if (codeMirror === undefined) {
        logger.error("can't upload image without codemirror reference")
        return
      }
      const description = Optional.ofNullable(codeMirror?.state)
        .map((state) => extractSelectedText(state))
        .orElse(undefined)
      handleUpload(codeMirror, file, undefined, description)
    },
    [codeMirror, handleUpload]
  )

  return (
    <Fragment>
      <Button
        variant='light'
        onClick={buttonClick}
        disabled={!codeMirror}
        title={t('editor.editorToolbar.uploadImage')}
        {...cypressId('editor-toolbar-upload-image-button')}>
        <ForkAwesomeIcon icon={'upload'} />
      </Button>
      <ShowIf condition={!!codeMirror}>
        <UploadInput
          onLoad={onUploadImage}
          allowedFileTypes={acceptedMimeTypes}
          onClickRef={clickRef}
          {...cypressId('editor-toolbar-upload-image-input')}
        />
      </ShowIf>
    </Fragment>
  )
}
