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
import { ApiError } from '../../../api/common/api-error'
import { useTranslation } from 'react-i18next'

/**
 * Renders a ldap login card for every ldap auth provider.
 */
export const LdapLoginCards: React.FC = () => {
  const { t } = useTranslation()
  const authProviders = useFrontendConfig().authProviders

  const errorMapping = useCallback(
    (error: Error) => {
      if (error instanceof ApiError) {
        const status = error.statusCode
        if (status === 401) {
          return t('login.auth.error.usernamePassword')
        }
      }
      return t('login.auth.error.other')
    },
    [t]
  )

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
