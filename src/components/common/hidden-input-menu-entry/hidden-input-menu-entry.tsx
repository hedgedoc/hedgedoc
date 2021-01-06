/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { Fragment, useCallback, useRef } from 'react'
import { Button, Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'
import { IconName } from '../fork-awesome/types'

export interface HiddenInputMenuEntryProps {
  type: 'dropdown' | 'button'
  acceptedFiles: string
  i18nKey: string
  icon: IconName
  onLoad: (file: File) => Promise<void>
}

export const HiddenInputMenuEntry: React.FC<HiddenInputMenuEntryProps> = ({ type, acceptedFiles, i18nKey, icon, onLoad }) => {
  const { t } = useTranslation()

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

  return (
    <Fragment>
      <input type='file' ref={fileInputReference} className='d-none' accept={acceptedFiles}/>
      {
        type === 'dropdown'
          ? <Dropdown.Item className={'small import-md-file'} onClick={onClick}>
              <ForkAwesomeIcon icon={icon} className={'mx-2'}/>
              <Trans i18nKey={i18nKey}/>
            </Dropdown.Item>
          : <Button variant='light' onClick={onClick} title={t(i18nKey)}>
              <ForkAwesomeIcon icon={icon}/>
            </Button>
      }
    </Fragment>
  )
}
