/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { UserAvatar } from '../../../common/user-avatar/user-avatar'
import { ActiveIndicator, ActiveIndicatorStatus } from './active-indicator'
import './user-line.scss'

export interface UserLineProps {
  name: string;
  photo: string;
  color: string;
  status: ActiveIndicatorStatus;
}

export const UserLine: React.FC<UserLineProps> = ({ name, photo, color, status }) => {
  return (
    <div className={'d-flex align-items-center h-100 w-100'}>
      <div className='d-inline-flex align-items-bottom user-line-color-indicator' style={{ borderLeftColor: color }}/>
      <UserAvatar photo={photo} name={name} additionalClasses={'flex-fill overflow-hidden px-2 text-nowrap w-100'}/>
      <div className={"active-indicator-container"}>
        <ActiveIndicator status={status} />
      </div>
    </div>
  )
}
