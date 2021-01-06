/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { ReactElement } from 'react'
import { ForkAwesomeIcon, ForkAwesomeIconProps } from './fork-awesome-icon'
import { IconSize } from './types'

export interface ForkAwesomeStackProps {
  size?: IconSize
  children: ReactElement<ForkAwesomeIconProps> | Array<ReactElement<ForkAwesomeIconProps>>
}

export const ForkAwesomeStack: React.FC<ForkAwesomeStackProps> = ({ size, children }) => {
  return (
    <span className={`fa-stack ${size ? 'fa-' : ''}${size ?? ''}`}>
      {
        React.Children.map(children, (child) => {
          if (!React.isValidElement<ForkAwesomeIconProps>(child)) {
            return null
          }
          return <ForkAwesomeIcon {...child.props} stacked={true}/>
        })
      }
    </span>
  )
}
