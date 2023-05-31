/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UiIcon } from '../../../components/common/icons/ui-icon'
import { acceptedMimeTypes } from '../../../components/common/upload-image-mimetypes'
import { cypressId } from '../../../utils/cypress-attribute'
import { useOnImageUpload } from './hooks/use-on-image-upload'
import { usePlaceholderSizeStyle } from './hooks/use-placeholder-size-style'
import styles from './image-placeholder.module.scss'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Upload as IconUpload } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

export interface PlaceholderImageFrameProps {
  alt?: string
  title?: string
  width?: string | number
  height?: string | number
  lineIndex?: number
  placeholderIndexInLine?: number
}

/**
 * Shows a placeholder for an actual image with the possibility to upload images via button or drag'n'drop.
 *
 * @param alt The alt text of the image. Will be shown in the placeholder
 * @param title The title text of the image. Will be shown in the placeholder
 * @param width The width of the placeholder
 * @param height The height of the placeholder
 * @param lineIndex The index of the line in the markdown content where the placeholder is defined
 * @param placeholderIndexInLine The index of the placeholder in the markdown line
 */
export const ImagePlaceholder: React.FC<PlaceholderImageFrameProps> = ({
  alt,
  title,
  width,
  height,
  lineIndex,
  placeholderIndexInLine
}) => {
  useTranslation()
  const fileInputReference = useRef<HTMLInputElement>(null)
  const onImageUpload = useOnImageUpload(lineIndex, placeholderIndexInLine)

  const [showDragStatus, setShowDragStatus] = useState(false)

  const onDropHandler = useCallback(
    (event: React.DragEvent<HTMLSpanElement>) => {
      event.preventDefault()
      if (event?.dataTransfer?.files?.length > 0) {
        onImageUpload(event.dataTransfer.files[0])
      }
    },
    [onImageUpload]
  )

  const onDragOverHandler = useCallback((event: React.DragEvent<HTMLSpanElement>) => {
    event.preventDefault()
    setShowDragStatus(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setShowDragStatus(false)
  }, [])

  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files
      if (!fileList || fileList.length < 1) {
        return
      }
      onImageUpload(fileList[0])
    },
    [onImageUpload]
  )

  const uploadButtonClicked = useCallback(() => fileInputReference.current?.click(), [])
  const containerStyle = usePlaceholderSizeStyle(width, height)

  const containerDragClasses = useMemo(() => (showDragStatus ? 'bg-primary text-white' : 'text-dark'), [showDragStatus])

  return (
    <span
      {...cypressId('image-placeholder-image-drop')}
      className={`${styles['image-drop']} d-inline-flex flex-column align-items-center ${containerDragClasses} p-1`}
      style={containerStyle}
      onDrop={onDropHandler}
      onDragOver={onDragOverHandler}
      onDragLeave={onDragLeave}>
      <input
        type='file'
        className='d-none'
        accept={acceptedMimeTypes}
        onChange={onChangeHandler}
        ref={fileInputReference}
      />
      <div className={'align-items-center flex-column justify-content-center flex-fill d-flex text-body-emphasis'}>
        <div className={'d-flex flex-column'}>
          <span className='my-2'>
            <Trans i18nKey={'editor.embeddings.placeholderImage.placeholderText'} />
          </span>
          <span className={styles['altText']}>{alt ?? title ?? ''}</span>
        </div>
      </div>
      <Button size={'sm'} variant={'primary'} onClick={uploadButtonClicked}>
        <UiIcon icon={IconUpload} className='my-2' />
        <Trans i18nKey={'editor.embeddings.placeholderImage.upload'} className='my-2' />
      </Button>
    </span>
  )
}
