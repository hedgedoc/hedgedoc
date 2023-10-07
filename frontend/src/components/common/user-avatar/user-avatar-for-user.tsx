/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { UserInfo } from '../../../api/users/types'
import type { UserAvatarProps } from './user-avatar'
import { UserAvatar } from './user-avatar'
import React from 'react'

export interface UserAvatarForUserProps extends Omit<UserAvatarProps, 'photoUrl' | 'displayName'> {
  user: UserInfo
}

/**
 * Renders the avatar image of a user, optionally altogether with their name.
 *
 * @param user The user object with the display name and photo.
 * @param props remaining avatar props
 */
export const UserAvatarForUser: React.FC<UserAvatarForUserProps> = ({ user, ...props }) => {
  return <UserAvatar displayName={user.displayName} photoUrl={user.photoUrl} {...props} />
}
