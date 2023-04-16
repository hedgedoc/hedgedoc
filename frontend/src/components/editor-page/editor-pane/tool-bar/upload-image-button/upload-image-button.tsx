/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../../utils/cypress-attribute'
import { Logger } from '../../../../../utils/logger'
import { UiIcon } from '../../../../common/icons/ui-icon'
import { ShowIf } from '../../../../common/show-if/show-if'
import { acceptedMimeTypes } from '../../../../common/upload-image-mimetypes'
import { UploadInput } from '../../../../common/upload-input'
import { useCodemirrorReferenceContext } from '../../../change-content-context/codemirror-reference-context'
import { useHandleUpload } from '../../hooks/use-handle-upload'
import { extractSelectedText } from './extract-selected-text'
import { Optional } from '@mrdrogdrog/optional'
import React, { Fragment, useCallback, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { Upload as IconUpload } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

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

  const [codeMirror] = useCodemirrorReferenceContext()
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
        title={t('editor.editorToolbar.uploadImage') ?? undefined}
        {...cypressId('editor-toolbar-upload-image-button')}>
        <UiIcon icon={IconUpload} />
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
