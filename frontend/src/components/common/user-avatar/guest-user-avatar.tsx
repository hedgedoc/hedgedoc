/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { UserAvatar } from './user-avatar'
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { Person as IconPerson } from 'react-bootstrap-icons'
import type { CommonUserAvatarProps } from './types'

/**
 * The avatar component for an anonymous user.
 * @param props The properties of the guest user avatar ({@link UserAvatarProps})
 */
export const GuestUserAvatar: React.FC<CommonUserAvatarProps> = (props) => {
  const label = useTranslatedText('common.guestUser')
  return (
    <UserAvatar
      user={{
        username: '',
        photoUrl: null,
        displayName: label
      }}
      photoComponent={<IconPerson />}
      {...props}
    />
  )
}
