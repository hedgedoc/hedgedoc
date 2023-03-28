/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UserAvatar } from '../../../common/user-avatar/user-avatar'
import { UserAvatarForUsername } from '../../../common/user-avatar/user-avatar-for-username'
import { createCursorCssClass } from '../../editor-pane/codemirror-extensions/remote-cursors/create-cursor-css-class'
import { ActiveIndicator } from '../users-online-sidebar-menu/active-indicator'
import styles from './user-line.module.scss'
import React, { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export interface UserLineProps {
  username: string | null
  displayName: string
  active: boolean
  own?: boolean
  color: number
}

/**
 * Represents a user in the realtime activity status.
 *
 * @param username The username of the user to show
 * @param color The color of the user's edits
 * @param status The user's current online status
 * @param displayName The actual name that should be displayed
 * @param own defines if this user line renders the own user or another one
 */
export const UserLine: React.FC<UserLineProps> = ({ username, displayName, active, own = false, color }) => {
  useTranslation()

  const avatar = useMemo(() => {
    if (username) {
      return (
        <UserAvatarForUsername
          username={username}
          additionalClasses={'flex-fill overflow-hidden px-2 text-nowrap w-100'}
        />
      )
    } else {
      return (
        <UserAvatar displayName={displayName} additionalClasses={'flex-fill overflow-hidden px-2 text-nowrap w-100'} />
      )
    }
  }, [displayName, username])

  return (
    <div className={'d-flex align-items-center h-100 w-100'}>
      <div
        className={`d-inline-flex align-items-bottom ${styles['user-line-color-indicator']} ${createCursorCssClass(
          color
        )}`}
      />
      {avatar}
      {own ? (
        <span className={'px-1'}>
          <Trans i18nKey={'editor.onlineStatus.you'}></Trans>
        </span>
      ) : (
        <ActiveIndicator active={active} />
      )}
    </div>
  )
}
