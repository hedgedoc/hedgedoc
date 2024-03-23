/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserInfo } from '../../../api/users'
import { AsyncLoadingBoundary } from '../async-loading-boundary/async-loading-boundary'
import type { UserAvatarProps } from './user-avatar'
import { UserAvatar } from './user-avatar'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsync } from 'react-use'

export interface UserAvatarForUsernameProps extends Omit<UserAvatarProps, 'photoUrl' | 'displayName'> {
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
  const { error, value, loading } = useAsync(async (): Promise<{ displayName: string; photo?: string }> => {
    return username
      ? await getUserInfo(username)
      : {
          displayName: t('common.guestUser')
        }
  }, [username, t])

  const avatar = useMemo(() => {
    if (!value) {
      return null
    }
    return <UserAvatar displayName={value.displayName} photoUrl={value.photo} username={username} {...props} />
  }, [props, value, username])

  return (
    <AsyncLoadingBoundary loading={loading || !value} error={error} componentName={'UserAvatarForUsername'}>
      {avatar}
    </AsyncLoadingBoundary>
  )
}
