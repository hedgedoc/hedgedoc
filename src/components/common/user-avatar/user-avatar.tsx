/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ShowIf } from '../show-if/show-if'
import styles from './user-avatar.module.scss'
import type { UserInfo } from '../../../api/users/types'
import defaultAvatar from './default-avatar.png'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import type { OverlayInjectedProps } from 'react-bootstrap/Overlay'

export interface UserAvatarProps {
  size?: 'sm' | 'lg'
  additionalClasses?: string
  showName?: boolean
  user: UserInfo
}

/**
 * Renders the avatar image of a user, optionally altogether with their name.
 *
 * @param user The user object with the display name and photo.
 * @param size The size in which the user image should be shown.
 * @param additionalClasses Additional CSS classes that will be added to the container.
 * @param showName true when the name should be displayed alongside the image, false otherwise. Defaults to true.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size, additionalClasses = '', showName = true }) => {
  const { t } = useTranslation()

  const imageSize = useMemo(() => {
    switch (size) {
      case 'sm':
        return 16
      case 'lg':
        return 30
      default:
        return 20
    }
  }, [size])

  const avatarUrl = useMemo(() => {
    return user.photo !== '' ? user.photo : defaultAvatar.src
  }, [user.photo])

  const imgDescription = useMemo(() => t('common.avatarOf', { name: user.displayName }), [t, user])

  const tooltip = useCallback(
    (props: OverlayInjectedProps) => (
      <Tooltip id={user.displayName} {...props}>
        {user.displayName}
      </Tooltip>
    ),
    [user]
  )

  return (
    <span className={'d-inline-flex align-items-center ' + additionalClasses}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarUrl}
        className={`rounded ${styles['user-image']}`}
        alt={imgDescription}
        title={imgDescription}
        height={imageSize}
        width={imageSize}
      />
      <ShowIf condition={showName}>
        <OverlayTrigger overlay={tooltip}>
          <span className={`ml-2 mr-1 ${styles['user-line-name']}`}>{user.displayName}</span>
        </OverlayTrigger>
      </ShowIf>
    </span>
  )
}
