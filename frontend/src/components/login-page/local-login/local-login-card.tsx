/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react'
import { Card } from 'react-bootstrap'
import { doLocalLogin } from '../../../api/auth/local'
import { useFrontendConfig } from '../../common/frontend-config-context/use-frontend-config'
import { AuthProviderType } from '@hedgedoc/commons'
import { LocalRegisterCardBody } from './register/local-register-card-body'
import { UsernamePasswordLogin } from '../username-password-login'
import { ErrorToI18nKeyMapper } from '../../../api/common/error-to-i18n-key-mapper'
import { useTranslation } from 'react-i18next'

/**
 * Shows the card that processes local logins and registers.
 */
export const LocalLoginCard: React.FC = () => {
  const { t } = useTranslation()
  const frontendConfig = useFrontendConfig()

  const performLocalLogin = useCallback(async (username: string, password: string, _: unknown) => {
    await doLocalLogin(username, password)
    return { newUser: false }
  }, [])

  const errorMapping = useCallback(
    (error: Error) => {
      const key = new ErrorToI18nKeyMapper(error, 'login.auth.error')
        .withHttpCode(404, 'usernamePassword')
        .withHttpCode(401, 'usernamePassword')
        .withBackendErrorName('FeatureDisabledError', 'loginDisabled')
        .orFallbackI18nKey('other')
      return t(key)
    },
    [t]
  )

  const localLoginEnabled = useMemo(() => {
    return frontendConfig.authProviders.some((provider) => provider.type === AuthProviderType.LOCAL)
  }, [frontendConfig])

  if (!localLoginEnabled) {
    return null
  }

  return (
    <Card>
      <UsernamePasswordLogin lowercaseUsername={true} doLogin={performLocalLogin} errorMapping={errorMapping} />
      {frontendConfig.allowRegister && (
        <>
          <hr className={'m-0'} />
          <LocalRegisterCardBody />
        </>
      )}
    </Card>
  )
}
