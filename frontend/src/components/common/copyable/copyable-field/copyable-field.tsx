/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../fork-awesome/fork-awesome-icon'
import { ShowIf } from '../../show-if/show-if'
import { Logger } from '../../../../utils/logger'
import { isClientSideRendering } from '../../../../utils/is-client-side-rendering'
import { CopyToClipboardButton } from '../copy-to-clipboard-button/copy-to-clipboard-button'

export interface CopyableFieldProps {
  content: string
  shareOriginUrl?: string
}

const log = new Logger('CopyableField')

/**
 * Provides an input field with an attached copy button and a share button (if supported by the browser).
 *
 * @param content The content to present
 * @param shareOriginUrl The URL of the page to which the shared content should be linked. If this value is omitted then the share button won't be shown.
 */
export const CopyableField: React.FC<CopyableFieldProps> = ({ content, shareOriginUrl }) => {
  useTranslation()

  const sharingSupported = useMemo(
    () => shareOriginUrl !== undefined && isClientSideRendering() && typeof navigator.share === 'function',
    [shareOriginUrl]
  )

  const doShareAction = useCallback(() => {
    if (!sharingSupported) {
      log.error('Native sharing not available')
      return
    }
    navigator
      .share({
        text: content,
        url: shareOriginUrl
      })
      .catch((error: Error) => {
        log.error('Native sharing failed', error)
      })
  }, [content, shareOriginUrl, sharingSupported])

  return (
    <InputGroup className='my-3'>
      <FormControl readOnly={true} className={'text-center'} value={content} />
      <InputGroup.Text>
        <CopyToClipboardButton variant={'outline-secondary'} content={content} />
      </InputGroup.Text>
      <ShowIf condition={sharingSupported}>
        <InputGroup.Text>
          <Button variant='secondary' title={'Share'} onClick={doShareAction}>
            <ForkAwesomeIcon icon='share-alt' />
          </Button>
        </InputGroup.Text>
      </ShowIf>
    </InputGroup>
  )
}
