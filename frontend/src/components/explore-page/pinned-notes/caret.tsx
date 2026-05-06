/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import {
  CaretLeft as IconCaretLeftEmpty,
  CaretLeftFill as IconCaretLeft,
  CaretRight as IconCaretRightEmpty,
  CaretRightFill as IconCaretRight
} from 'react-bootstrap-icons'
import styles from './caret.module.scss'
import { UiIcon } from '../../common/icons/ui-icon'
import { concatCssClasses } from '../../../utils/concat-css-classes'

interface CaretProps {
  left: boolean
  active: boolean
  onClick?: () => void
}

/**
 * Renders the caret icon which is used for scroll-clicking through the list of pinned notes.
 *
 * @param active true if the caret is active (clickable), false otherwise
 * @param left true if the caret points to the left, false if it points to the right
 * @param onClick Handler for the click event
 */
export const Caret: React.FC<CaretProps> = ({ active, left, onClick }) => {
  const activeIcon = useMemo(() => (left ? IconCaretLeft : IconCaretRight), [left])
  const inactiveIcon = useMemo(() => (left ? IconCaretLeftEmpty : IconCaretRightEmpty), [left])

  return (
    <button
      onClick={active ? onClick : undefined}
      disabled={!active}
      className={concatCssClasses('unstyled-button', {
        [styles.active]: active
      })}>
      <UiIcon icon={active ? activeIcon : inactiveIcon} size={2} />
    </button>
  )
}
