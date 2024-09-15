/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import type { UserAvatarProps } from './user-avatar'
import { UserAvatar } from './user-avatar'
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { Person as IconPerson } from 'react-bootstrap-icons'

export type GuestUserAvatarProps = Omit<UserAvatarProps, 'displayName' | 'photoUrl' | 'username'>

/**
 * The avatar component for an anonymous user.
 * @param props The properties of the guest user avatar ({@link UserAvatarProps})
 */
export const GuestUserAvatar: React.FC<GuestUserAvatarProps> = (props) => {
  const label = useTranslatedText('common.guestUser')
  return <UserAvatar displayName={label} photoComponent={<IconPerson />} {...props} />
}
