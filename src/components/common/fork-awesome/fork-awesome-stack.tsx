/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactElement } from 'react'
import React from 'react'
import type { ForkAwesomeIconProps } from './fork-awesome-icon'
import { ForkAwesomeIcon } from './fork-awesome-icon'
import type { IconSize } from './types'

export interface ForkAwesomeStackProps {
  size?: IconSize
  children: ReactElement<ForkAwesomeIconProps> | Array<ReactElement<ForkAwesomeIconProps>>
}

export const ForkAwesomeStack: React.FC<ForkAwesomeStackProps> = ({ size, children }) => {
  return (
    <span className={`fa-stack ${size ? 'fa-' : ''}${size ?? ''}`}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<ForkAwesomeIconProps>(child)) {
          return null
        }
        return <ForkAwesomeIcon {...child.props} stacked={true} />
      })}
    </span>
  )
}
