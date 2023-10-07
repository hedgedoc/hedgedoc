/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { ShowIf } from '../show-if/show-if'
import styles from './user-avatar.module.scss'
import React, { useCallback, useMemo } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import type { OverlayInjectedProps } from 'react-bootstrap/Overlay'
import { useAvatarUrl } from './hooks/use-avatar-url'

export interface UserAvatarProps {
  size?: 'sm' | 'lg'
  additionalClasses?: string
  showName?: boolean
  photoUrl?: string
  displayName: string
}

/**
 * Renders the avatar image of a user, optionally altogether with their name.
 *
 * @param user The user object with the display name and photo.
 * @param size The size in which the user image should be shown.
 * @param additionalClasses Additional CSS classes that will be added to the container.
 * @param showName true when the name should be displayed alongside the image, false otherwise. Defaults to true.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  photoUrl,
  displayName,
  size,
  additionalClasses = '',
  showName = true
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

  const avatarUrl = useAvatarUrl(photoUrl, displayName)

  const imageTranslateOptions = useMemo(
    () => ({
      name: displayName
    }),
    [displayName]
  )
  const imgDescription = useTranslatedText('common.avatarOf', imageTranslateOptions)

  const tooltip = useCallback(
    (overlayInjectedProps: OverlayInjectedProps) => (
      <Tooltip id={displayName} {...overlayInjectedProps}>
        {displayName}
      </Tooltip>
    ),
    [displayName]
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
          <span className={`ms-2 me-1 ${styles['user-line-name']}`}>{displayName}</span>
        </OverlayTrigger>
      </ShowIf>
    </span>
  )
}
