/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { ActiveIndicator } from '../users-online-sidebar-menu/active-indicator'
import styles from './user-line.module.scss'
import { UserAvatarForUsername } from '../../../common/user-avatar/user-avatar-for-username'
import type { ActiveIndicatorStatus } from '../../../../redux/realtime/types'

export interface UserLineProps {
  username: string | null
  color: string
  status: ActiveIndicatorStatus
}

/**
 * Represents a user in the realtime activity status.
 *
 * @param username The name of the user to show.
 * @param color The color of the user's edits.
 * @param status The user's current online status.
 */
export const UserLine: React.FC<UserLineProps> = ({ username, color, status }) => {
  return (
    <div className={'d-flex align-items-center h-100 w-100'}>
      <div
        className={`d-inline-flex align-items-bottom ${styles['user-line-color-indicator']}`}
        style={{ borderLeftColor: color }}
      />
      <UserAvatarForUsername
        username={username}
        additionalClasses={'flex-fill overflow-hidden px-2 text-nowrap w-100'}
      />
      <div className={styles['active-indicator-container']}>
        <ActiveIndicator status={status} />
      </div>
    </div>
  )
}
