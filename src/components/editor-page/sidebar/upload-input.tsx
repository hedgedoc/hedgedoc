/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
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
  acceptedFiles: string
  onClickRef: MutableRefObject<(() => void) | undefined>
}

export const UploadInput: React.FC<UploadInputProps> = ({ onLoad, acceptedFiles, onClickRef, ...props }) => {
  const fileInputReference = useRef<HTMLInputElement>(null)
  const onClick = useCallback(() => {
    const fileInput = fileInputReference.current
    if (!fileInput) {
      return
    }
    fileInput.addEventListener('change', () => {
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
    })
    fileInput.click()
  }, [onLoad])

  useEffect(() => {
    onClickRef.current = onClick
  })

  return <input {...cypressId(props)} type='file' ref={fileInputReference} className='d-none' accept={acceptedFiles} />
}
