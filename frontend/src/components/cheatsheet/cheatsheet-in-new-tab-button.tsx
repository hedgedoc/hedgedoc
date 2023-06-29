/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../hooks/common/use-translated-text'
import { useOutlineButtonVariant } from '../../hooks/dark-mode/use-outline-button-variant'
import { IconButton } from '../common/icon-button/icon-button'
import type { MouseEvent } from 'react'
import React, { useCallback } from 'react'
import { BoxArrowUpRight } from 'react-bootstrap-icons'

export interface CheatsheetInNewTabButtonProps {
  onClick?: () => void
}

/**
 * Renders a button that opens the cheatsheet in a new tab.
 */
export const CheatsheetInNewTabButton: React.FC<CheatsheetInNewTabButtonProps> = ({ onClick }) => {
  const openPopUp = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      window.open('/cheatsheet', '_blank', 'menubar=no,width=1000,height=600,location=no,toolbar=no')
      onClick?.()
    },
    [onClick]
  )
  const buttonVariant = useOutlineButtonVariant()
  const buttonTitle = useTranslatedText('cheatsheet.modal.popup')

  return (
    <IconButton
      size={'sm'}
      iconSize={1.2}
      href={'/cheatsheet'}
      onClick={openPopUp}
      icon={BoxArrowUpRight}
      className={'p-2 border-0'}
      variant={buttonVariant}
      target={'_blank'}
      title={buttonTitle}
    />
  )
}
