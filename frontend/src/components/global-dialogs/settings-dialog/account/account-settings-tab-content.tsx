/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getLinkedIdentities } from '../../../../api/identities'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { ProfileAccountManagement } from '../../../profile-page/account-management/profile-account-management'
import { ProfileChangePassword } from '../../../profile-page/settings/profile-change-password'
import { ProfileDisplayName } from '../../../profile-page/settings/profile-display-name'
import { UserAvatar } from '../../../common/user-avatar/user-avatar'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import { LinkedIdentities } from './linked-identities'
import React, { useCallback, useEffect, useState } from 'react'
import { Trans } from 'react-i18next'
import type { LinkedIdentityInterface } from '@hedgedoc/commons'
import { AuthProviderType } from '@hedgedoc/commons'

/**
 * Shows account settings or a sign-in prompt when no account is active.
 */
export const AccountSettingsTabContent: React.FC = () => {
  const user = useApplicationState((state) => state.user)
  const [identities, setIdentities] = useState<LinkedIdentityInterface[]>([])
  const { showErrorNotificationBuilder } = useUiNotifications()

  const refreshIdentities = useCallback(() => {
    getLinkedIdentities()
      .then(setIdentities)
      .catch(showErrorNotificationBuilder('profile.linkedIdentities.loadingFailed'))
  }, [showErrorNotificationBuilder])

  useEffect(() => {
    if (user && user.authProvider !== AuthProviderType.GUEST) {
      refreshIdentities()
    }
  }, [refreshIdentities, user])

  if (!user || user.authProvider === AuthProviderType.GUEST) {
    return (
      <div className='d-flex align-items-center justify-content-center text-center' style={{ minHeight: '18rem' }}>
        <Trans i18nKey='settings.account.loginRequired' />
      </div>
    )
  }

  const hasLocalIdentity = identities.some((identity) => identity.providerType === AuthProviderType.LOCAL)

  return (
    <div className='py-3'>
      <div className='d-flex align-items-center mb-4'>
        <UserAvatar user={user} size='lg' />
      </div>
      <ProfileDisplayName />
      {hasLocalIdentity && <ProfileChangePassword />}
      <LinkedIdentities identities={identities} />
      <ProfileAccountManagement />
    </div>
  )
}
