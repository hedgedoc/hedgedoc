/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { ProfileAccessTokens } from '../../../profile-page/access-tokens/profile-access-tokens'
import React from 'react'
import { Trans } from 'react-i18next'
import { AuthProviderType } from '@hedgedoc/commons'

/**
 * Shows API token management for an authenticated account.
 */
export const ApiSettingsTabContent: React.FC = () => {
  const user = useApplicationState((state) => state.user)

  if (!user || user.authProvider === AuthProviderType.GUEST) {
    return (
      <div className='d-flex align-items-center justify-content-center text-center' style={{ minHeight: '18rem' }}>
        <Trans i18nKey='settings.api.loginRequired' />
      </div>
    )
  }

  return <ProfileAccessTokens />
}
