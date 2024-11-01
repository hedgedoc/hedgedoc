/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../../hooks/common/use-translated-text'
import type { PropsWithDataCypressId } from '../../../../utils/cypress-attribute'
import { cypressId } from '../../../../utils/cypress-attribute'
import { UiIcon } from '../../icons/ui-icon'
import { useCopyOverlay } from '../hooks/use-copy-overlay'
import React, { Fragment, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { Files as IconFiles } from 'react-bootstrap-icons'
import type { Variant } from 'react-bootstrap/types'
import styles from './style.module.scss'

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
  const button = useRef<HTMLButtonElement>(null)
  const [copyToClipboard, overlayElement] = useCopyOverlay(button, content)
  const buttonTitle = useTranslatedText('renderer.highlightCode.copyCode')

  return (
    <Fragment>
      <Button
        className={styles['copy-button']}
        ref={button}
        size={size}
        variant={variant}
        title={buttonTitle}
        onClick={copyToClipboard}
        {...cypressId(props)}>
        <UiIcon icon={IconFiles} />
      </Button>
      {overlayElement}
    </Fragment>
  )
}
