/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { Variant } from 'react-bootstrap/types'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../fork-awesome/fork-awesome-icon'
import { CopyOverlay } from '../copy-overlay'

export interface CopyToClipboardButtonProps {
  content: string
  size?: 'sm' | 'lg'
  variant?: Variant
  "data-cy"?: string
}

export const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({
                                                                              content,
                                                                              size = 'sm',
                                                                              variant = 'dark',
                                                                              ...props
                                                                            }) => {
  const { t } = useTranslation()
  const button = useRef<HTMLButtonElement>(null)

  return (
    <Fragment>
      <Button ref={button} size={size} variant={variant} title={t('renderer.highlightCode.copyCode')}
              data-cy={props["data-cy"]}>
        <ForkAwesomeIcon icon='files-o'/>
      </Button>
      <CopyOverlay content={content} clickComponent={button}/>
    </Fragment>
  )
}
