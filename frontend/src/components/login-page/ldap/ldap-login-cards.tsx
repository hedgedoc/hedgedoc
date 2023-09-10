/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useMemo } from 'react'
import { useFrontendConfig } from '../../common/frontend-config-context/use-frontend-config'
import type { AuthProviderWithCustomName } from '../../../api/config/types'
import { AuthProviderType } from '../../../api/config/types'
import { LdapLoginCard } from './ldap-login-card'

/**
 * Renders a ldap login card for every ldap auth provider.
 */
export const LdapLoginCards: React.FC = () => {
  const authProviders = useFrontendConfig().authProviders

  const ldapProviders = useMemo(() => {
    return authProviders
      .filter((provider) => provider.type === AuthProviderType.LDAP)
      .map((provider) => {
        const ldapProvider = provider as AuthProviderWithCustomName
        return (
          <LdapLoginCard
            providerName={ldapProvider.providerName}
            identifier={ldapProvider.identifier}
            key={ldapProvider.identifier}
          />
        )
      })
  }, [authProviders])

  return ldapProviders.length === 0 ? null : <Fragment>{ldapProviders}</Fragment>
}
