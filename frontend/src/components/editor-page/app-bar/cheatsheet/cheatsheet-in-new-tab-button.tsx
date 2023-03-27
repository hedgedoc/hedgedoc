/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IconButton } from '../../../common/icon-button/icon-button'
import type { MouseEvent } from 'react'
import React, { useCallback } from 'react'
import { BoxArrowUpRight } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

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

  const { t } = useTranslation()

  return (
    <IconButton
      size={'sm'}
      iconSize={1.2}
      href={'/cheatsheet'}
      onClick={openPopUp}
      icon={BoxArrowUpRight}
      className={'p-2 border-0'}
      variant={'outline-dark'}
      target={'_blank'}
      title={t('cheatsheet.modal.popup') ?? ''}
    />
  )
}
