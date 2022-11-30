/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ForkAwesomeIconProps } from './fork-awesome-icon'
import { ForkAwesomeIcon } from './fork-awesome-icon'
import type { IconSize } from './types'
import type { ReactElement } from 'react'
import React from 'react'

export interface ForkAwesomeStackProps {
  size?: IconSize
  children: ReactElement<ForkAwesomeIconProps> | Array<ReactElement<ForkAwesomeIconProps>>
}

/**
 * A stack of {@link ForkAwesomeIcon ForkAwesomeIcons}.
 *
 * @param size Which size the stack should have.
 * @param children One or more {@link ForkAwesomeIcon ForkAwesomeIcons} to be stacked.
 */
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
