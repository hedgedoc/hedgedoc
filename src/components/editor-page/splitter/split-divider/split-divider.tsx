/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import styles from './split-divider.module.scss'
import { testId } from '../../../../utils/test-id'

export interface SplitDividerProps {
  onGrab: () => void
}

export const SplitDivider: React.FC<SplitDividerProps> = ({ onGrab }) => {
  return (
    <div
      onMouseDown={onGrab}
      onTouchStart={onGrab}
      className={styles['split-divider']}
      {...testId('splitter-divider')}
    />
  )
}
