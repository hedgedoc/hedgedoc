/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UserAvatarForUsername } from '../../../../../common/user-avatar/user-avatar-for-username'
import { createCursorCssClass } from '../../../../editor-pane/codemirror-extensions/remote-cursors/create-cursor-css-class'
import { ActiveIndicator } from '../active-indicator'
import styles from './user-line.module.scss'
import React, { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Incognito as IconIncognito } from 'react-bootstrap-icons'
import { useTranslatedText } from '../../../../../../hooks/common/use-translated-text'
import { GuestUserAvatar } from '../../../../../common/user-avatar/guest-user-avatar'

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
  const guestUserTitle = useTranslatedText('editor.onlineStatus.guestUser')

  const avatar = useMemo(() => {
    return username ? (
      <UserAvatarForUsername username={username} additionalClasses={'flex-fill overflow-hidden px-2 text-nowrap'} />
    ) : (
      <GuestUserAvatar
        overrideDisplayName={displayName}
        additionalClasses={'flex-fill overflow-hidden px-2 text-nowrap'}
      />
    )
  }, [displayName, username])

  return (
    <div className={'d-flex h-100 w-100'}>
      <div className={`${styles['user-line-color-indicator']} ${createCursorCssClass(color)}`} />
      {avatar}
      <div className={'ms-auto d-flex align-items-center gap-1 h-100'}>
        {!username && <IconIncognito title={guestUserTitle} size={'16px'} className={'text-muted'} />}
        {own ? (
          <span className={'px-1'}>
            <Trans i18nKey={'editor.onlineStatus.you'}></Trans>
          </span>
        ) : (
          <ActiveIndicator active={active} />
        )}
      </div>
    </div>
  )
}
