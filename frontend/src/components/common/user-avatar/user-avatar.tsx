/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import styles from './user-avatar.module.scss'
import React, { useMemo } from 'react'
import { useAvatarUrl } from './hooks/use-avatar-url'

export interface UserAvatarProps {
  size?: 'sm' | 'lg'
  additionalClasses?: string
  showName?: boolean
  photoUrl?: string
  displayName: string
  username?: string | null
  photoComponent?: React.ReactNode
}

/**
 * Renders the avatar image of a user, optionally altogether with their name.
 *
 * @param user The user object with the display name and photo.
 * @param size The size in which the user image should be shown.
 * @param additionalClasses Additional CSS classes that will be added to the container.
 * @param showName true when the name should be displayed alongside the image, false otherwise. Defaults to true.
 * @param username The username to use for generating the fallback avatar image.
 * @param photoComponent A custom component to use as the user's photo.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  photoUrl,
  displayName,
  size,
  additionalClasses = '',
  showName = true,
  username,
  photoComponent
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

  const avatarUrl = useAvatarUrl(photoUrl, username ?? displayName)

  const imageTranslateOptions = useMemo(
    () => ({
      name: displayName
    }),
    [displayName]
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
      {showName && <span className={`ms-2 me-1 ${styles['user-line-name']}`}>{displayName}</span>}
    </span>
  )
}
