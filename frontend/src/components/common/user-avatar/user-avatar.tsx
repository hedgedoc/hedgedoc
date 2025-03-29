/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import styles from './user-avatar.module.scss'
import React, { useMemo } from 'react'
import { useAvatarUrl } from './hooks/use-avatar-url'
import type { UserInfoDto } from '@hedgedoc/commons'
import type { CommonUserAvatarProps } from './types'

interface UserAvatarProps extends CommonUserAvatarProps {
  user: UserInfoDto
}

/**
 * Renders the avatar image of a user, optionally altogether with their name.
 *
 * @param user The user object with the display name and photo.
 * @param size The size in which the user image should be shown.
 * @param additionalClasses Additional CSS classes that will be added to the container.
 * @param showName true when the name should be displayed alongside the image, false otherwise. Defaults to true.
 * @param photoComponent A custom component to use as the user's photo.
 * @param overrideDisplayName Used to override the used display name, for example for setting random guest names
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  size,
  additionalClasses = '',
  showName = true,
  photoComponent,
  user,
  overrideDisplayName
}) => {
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

  const modifiedUser: UserInfoDto = useMemo(
    () => ({
      ...user,
      displayName: overrideDisplayName ?? user.displayName
    }),
    [user, overrideDisplayName]
  )

  const avatarUrl = useAvatarUrl(modifiedUser)

  const imageTranslateOptions = useMemo(
    () => ({
      name: modifiedUser.displayName
    }),
    [modifiedUser.displayName]
  )
  const imgDescription = useTranslatedText('common.avatarOf', imageTranslateOptions)

  return (
    <span className={'d-inline-flex align-items-center ' + additionalClasses}>
      {photoComponent ?? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          className={`rounded ${styles['user-image']}`}
          alt={imgDescription}
          title={imgDescription}
          height={imageSize}
          width={imageSize}
        />
      )}
      {showName && <span className={`ms-2 me-1 ${styles['user-line-name']}`}>{modifiedUser.displayName}</span>}
    </span>
  )
}
