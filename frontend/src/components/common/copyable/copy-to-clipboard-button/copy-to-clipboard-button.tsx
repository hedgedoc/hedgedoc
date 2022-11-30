/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithDataCypressId } from '../../../../utils/cypress-attribute'
import { cypressId } from '../../../../utils/cypress-attribute'
import { ForkAwesomeIcon } from '../../fork-awesome/fork-awesome-icon'
import { useCopyOverlay } from '../hooks/use-copy-overlay'
import React, { Fragment, useRef } from 'react'
import { Button } from 'react-bootstrap'
import type { Variant } from 'react-bootstrap/types'
import { useTranslation } from 'react-i18next'

export interface CopyToClipboardButtonProps extends PropsWithDataCypressId {
  content: string
  size?: 'sm' | 'lg'
  variant?: Variant
}

/**
 * Shows a button that copies the given content on click.
 *
 * @param content The content to copy
 * @param size The size of the button
 * @param variant The bootstrap variant of the button
 * @param props Other props that are forwarded to the bootstrap button
 */
export const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({
  content,
  size = 'sm',
  variant = 'dark',
  ...props
}) => {
  const { t } = useTranslation()
  const button = useRef<HTMLButtonElement>(null)

  const [copyToClipboard, overlayElement] = useCopyOverlay(button, content)

  return (
    <Fragment>
      <Button
        ref={button}
        size={size}
        variant={variant}
        title={t('renderer.highlightCode.copyCode') ?? undefined}
        onClick={copyToClipboard}
        {...cypressId(props)}>
        <ForkAwesomeIcon icon='files-o' />
      </Button>
      {overlayElement}
    </Fragment>
  )
}
