/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { MutableRefObject, useCallback, useEffect, useRef } from 'react'

export interface UploadInputProps {
  onLoad: (file: File) => Promise<void>
  acceptedFiles: string
  onClickRef: MutableRefObject<(() => void) | undefined>
  "data-cy"?: string
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
      onLoad(file).then(() => {
        fileInput.value = ''
      }).catch((error) => {
        console.error(error)
      })
    })
    fileInput.click()
  }, [onLoad])

  useEffect(() => {
    onClickRef.current = onClick
  })

  return (
    <input data-cy={props["data-cy"]} type='file' ref={fileInputReference} className='d-none' accept={acceptedFiles}/>
  )
}
