/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUser } from '../../../api/users'
import type { UserInfo } from '../../../api/users/types'
import { AsyncLoadingBoundary } from '../async-loading-boundary/async-loading-boundary'
import type { UserAvatarProps } from './user-avatar'
import { UserAvatar } from './user-avatar'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAsync } from 'react-use'

export interface UserAvatarForUsernameProps extends Omit<UserAvatarProps, 'user'> {
  username: string | null
}

/**
 * Renders the user avatar for a given username.
 * When no username is given, the guest user will be used as fallback.
 *
 * @see UserAvatar
 *
 * @param username The username for which to show the avatar or null to show the guest user avatar.
 * @param props Additional props directly given to the {@link UserAvatar}
 */
export const UserAvatarForUsername: React.FC<UserAvatarForUsernameProps> = ({ username, ...props }) => {
  const { t } = useTranslation()
  const { error, value, loading } = useAsync(async (): Promise<UserInfo> => {
    if (username) {
      return await getUser(username)
    }
    return {
      displayName: t('common.guestUser'),
      photo: `public/img/avatar.png`,
      username: ''
    }
  }, [username, t])

  return (
    <AsyncLoadingBoundary loading={loading || !value} error={error} componentName={'UserAvatarForUsername'}>
      <UserAvatar user={value as UserInfo} {...props} />
    </AsyncLoadingBoundary>
  )
}
