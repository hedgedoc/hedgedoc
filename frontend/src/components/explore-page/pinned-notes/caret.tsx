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

interface CaretProps {
  left: boolean
  active: boolean
  onClick?: () => void
}

export const Caret: React.FC<CaretProps> = ({ active, left, onClick }) => {
  const activeIcon = useMemo(() => (left ? IconCaretLeft : IconCaretRight), [left])
  const inactiveIcon = useMemo(() => (left ? IconCaretLeftEmpty : IconCaretRightEmpty), [left])

  return (
    <div onClick={active ? onClick : undefined} className={`${active ? styles.active : undefined}`}>
      <UiIcon icon={active ? activeIcon : inactiveIcon} size={2} />
    </div>
  )
}
