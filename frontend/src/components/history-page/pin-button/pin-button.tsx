/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressAttribute, cypressId } from '../../../utils/cypress-attribute'
import { UiIcon } from '../../common/icons/ui-icon'
import styles from './pin-button.module.scss'
import React from 'react'
import { Button } from 'react-bootstrap'
import { PinFill as IconPinFill } from 'react-bootstrap-icons'

export interface PinButtonProps {
  isPinned: boolean
  onPinClick: () => void
  isDark: boolean
  className?: string
}

/**
 * Renders a button with a pin icon.
 *
 * @param isPinned The initial state of this button.
 * @param onPinClick The callback, that is fired when the button is clicked.
 * @param isDark If the button should be rendered in dark or not.
 * @param className Additional classes directly given to the button
 */
export const PinButton: React.FC<PinButtonProps> = ({ isPinned, onPinClick, isDark, className }) => {
  return (
    <Button
      variant={isDark ? 'secondary' : 'secondary'}
      className={`${styles['history-pin']} ${className || ''} ${isPinned ? styles['pinned'] : ''}`}
      onClick={onPinClick}
      {...cypressId('history-entry-pin-button')}
      {...cypressAttribute('pinned', isPinned ? 'true' : 'false')}>
      <UiIcon icon={IconPinFill} />
    </Button>
  )
}
