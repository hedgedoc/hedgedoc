/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { useAsync } from 'react-use'
import { getUser } from '../../../api/users'
import { customizeAssetsUrl } from '../../../utils/customize-assets-url'
import type { UserAvatarProps } from './user-avatar'
import { UserAvatar } from './user-avatar'
import type { UserInfo } from '../../../api/users/types'
import { useTranslation } from 'react-i18next'
import { AsyncLoadingBoundary } from '../async-loading-boundary'

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
      photo: `${customizeAssetsUrl}img/avatar.png`,
      username: ''
    }
  }, [username, t])

  if (!value) {
    return null
  }

  return (
    <AsyncLoadingBoundary loading={loading} error={error} componentName={'UserAvatarForUsername'}>
      <UserAvatar user={value} {...props} />
    </AsyncLoadingBoundary>
  )
}
