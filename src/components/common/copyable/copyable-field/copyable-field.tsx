/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useRef } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../fork-awesome/fork-awesome-icon'
import { ShowIf } from '../../show-if/show-if'
import { CopyOverlay } from '../copy-overlay'
import { Logger } from '../../../../utils/logger'

export interface CopyableFieldProps {
  content: string
  nativeShareButton?: boolean
  url?: string
}

const log = new Logger('CopyableField')

export const CopyableField: React.FC<CopyableFieldProps> = ({ content, nativeShareButton, url }) => {
  useTranslation()
  const copyButton = useRef<HTMLButtonElement>(null)

  const doShareAction = useCallback(() => {
    navigator
      .share({
        text: content,
        url: url
      })
      .catch((error) => {
        log.error('Native sharing failed', error)
      })
  }, [content, url])

  const sharingSupported = typeof navigator.share === 'function'

  return (
    <Fragment>
      <InputGroup className='my-3'>
        <FormControl readOnly={true} className={'text-center'} value={content} />
        <InputGroup.Append>
          <Button variant='outline-secondary' ref={copyButton} title={'Copy'}>
            <ForkAwesomeIcon icon='files-o' />
          </Button>
        </InputGroup.Append>
        <ShowIf condition={!!nativeShareButton && sharingSupported}>
          <InputGroup.Append>
            <Button variant='outline-secondary' title={'Share'} onClick={doShareAction}>
              <ForkAwesomeIcon icon='share-alt' />
            </Button>
          </InputGroup.Append>
        </ShowIf>
      </InputGroup>
      <CopyOverlay content={content} clickComponent={copyButton} />
    </Fragment>
  )
}
