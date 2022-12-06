/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UserAvatarForUsername } from '../../../common/user-avatar/user-avatar-for-username'
import { createCursorCssClass } from '../../editor-pane/hooks/code-mirror-extensions/sync/remote-cursors/create-cursor-css-class'
import { ActiveIndicator } from '../users-online-sidebar-menu/active-indicator'
import styles from './user-line.module.scss'
import React from 'react'

export interface UserLineProps {
  username: string | null
  active: boolean
  color: number
}

/**
 * Represents a user in the realtime activity status.
 *
 * @param username The name of the user to show.
 * @param color The color of the user's edits.
 * @param status The user's current online status.
 */
export const UserLine: React.FC<UserLineProps> = ({ username, active, color }) => {
  return (
    <div className={'d-flex align-items-center h-100 w-100'}>
      <div
        className={`d-inline-flex align-items-bottom ${styles['user-line-color-indicator']} ${createCursorCssClass(
          color
        )}`}
      />
      <UserAvatarForUsername
        username={username}
        additionalClasses={'flex-fill overflow-hidden px-2 text-nowrap w-100'}
      />
      <div className={styles['active-indicator-container']}>
        <ActiveIndicator active={active} />
      </div>
    </div>
  )
}
