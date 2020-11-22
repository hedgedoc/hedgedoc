/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import './split-divider.scss'

export interface SplitDividerProps {
  onGrab: () => void
}

export const SplitDivider: React.FC<SplitDividerProps> = ({ onGrab }) => {
  return (
    <div
      onMouseDown={() => onGrab()}
      onTouchStart={() => onGrab()}
      className={'split-divider'}/>
  )
}
