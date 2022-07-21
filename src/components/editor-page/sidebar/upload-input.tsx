/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { MutableRefObject } from 'react'
import React, { useCallback, useEffect, useRef } from 'react'
import { Logger } from '../../../utils/logger'
import type { PropsWithDataCypressId } from '../../../utils/cypress-attribute'
import { cypressId } from '../../../utils/cypress-attribute'

const log = new Logger('UploadInput')

export interface UploadInputProps extends PropsWithDataCypressId {
  onLoad: (file: File) => Promise<void>
  allowedFileTypes: string
  onClickRef: MutableRefObject<(() => void) | undefined>
}

/**
 * Renders an input field to upload something.
 *
 * @param onLoad The callback to load the file.
 * @param allowedFileTypes A string indicating mime-types or file extensions.
 * @param onClickRef A reference for the onClick handler of the input.
 * @param props Additional props given to the input.
 */
export const UploadInput: React.FC<UploadInputProps> = ({ onLoad, allowedFileTypes, onClickRef, ...props }) => {
  const fileInputReference = useRef<HTMLInputElement>(null)
  const onClick = useCallback(() => {
    fileInputReference.current?.click()
  }, [])

  const onChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const fileInput = event.currentTarget
      if (!fileInput.files || fileInput.files.length < 1) {
        return
      }
      const file = fileInput.files[0]
      onLoad(file)
        .then(() => {
          fileInput.value = ''
        })
        .catch((error: Error) => {
          log.error('Error while uploading file', error)
        })
    },
    [onLoad]
  )

  useEffect(() => {
    onClickRef.current = onClick
  })

  return (
    <input
      {...cypressId(props)}
      onChange={onChange}
      type='file'
      ref={fileInputReference}
      className='d-none'
      accept={allowedFileTypes}
    />
  )
}
