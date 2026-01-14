/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useMemo } from 'react'
import { useFrontendConfig } from '../../common/frontend-config-context/use-frontend-config'
import type { AuthProviderWithCustomNameInterface } from '@hedgedoc/commons'
import { AuthProviderType } from '@hedgedoc/commons'
import { UsernamePasswordLogin } from '../username-password-login'
import { doLdapLogin } from '../../../api/auth/ldap'

/**
 * Renders a ldap login card for every ldap auth provider.
 */
export const LdapLoginCards: React.FC = () => {
  const authProviders = useFrontendConfig().authProviders

  const errorMapping = useCallback((error: Error) => {
    return String(error)
  }, [])
  const performLdapLogin = useCallback(async (username: string, password: string, identifier?: string) => {
    if (!identifier) {
      throw new Error('LDAP identifier is missing')
    }
    return doLdapLogin(identifier, username, password)
  }, [])

  const ldapProviders = useMemo(() => {
    return authProviders
      .filter((provider) => provider.type === AuthProviderType.LDAP)
      .map((provider) => {
        const ldapProvider = provider as AuthProviderWithCustomNameInterface
        return (
          <UsernamePasswordLogin
            key={ldapProvider.identifier}
            providerName={ldapProvider.providerName}
            authProviderIdentifier={ldapProvider.identifier}
            errorMapping={errorMapping}
            lowercaseUsername={false}
            doLogin={performLdapLogin}
          />
        )
      })
  }, [authProviders, performLdapLogin, errorMapping])

  return ldapProviders.length === 0 ? null : <Fragment>{ldapProviders}</Fragment>
}
