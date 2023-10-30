/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from '../../../../utils/logger'
import { UiIcon } from '../../icons/ui-icon'
import { CopyToClipboardButton } from '../copy-to-clipboard-button/copy-to-clipboard-button'
import React, { useCallback, useMemo } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap'
import { Share as IconShare } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

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
    () => shareOriginUrl !== undefined && typeof navigator.share === 'function',
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
      {sharingSupported && (
        <InputGroup.Text>
          <Button variant='secondary' title={'Share'} onClick={doShareAction}>
            <UiIcon icon={IconShare} />
          </Button>
        </InputGroup.Text>
      )}
    </InputGroup>
  )
}
