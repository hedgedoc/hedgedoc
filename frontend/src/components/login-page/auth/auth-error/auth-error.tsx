/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { AuthError as AuthErrorType } from '../../../../api/auth/types'
import { Trans, useTranslation } from 'react-i18next'
import { Alert } from 'react-bootstrap'

export interface AuthErrorProps {
  error?: AuthErrorType
}

/**
 * Renders an error message for auth fields when an error is present.
 *
 * @param error The error to render. Can be {@link undefined} when no error should be rendered.
 */
export const AuthError: React.FC<AuthErrorProps> = ({ error }) => {
  useTranslation()

  const errorMessageI18nKey = useMemo(() => {
    switch (error) {
      case AuthErrorType.INVALID_CREDENTIALS:
        return 'login.auth.error.usernamePassword'
      case AuthErrorType.LOGIN_DISABLED:
        return 'login.auth.error.loginDisabled'
      case AuthErrorType.OPENID_ERROR:
        return 'login.auth.error.openIdLogin'
      default:
        return 'login.auth.error.other'
    }
  }, [error])

  return (
    <Alert className='small' show={!!error} variant='danger'>
      <Trans i18nKey={errorMessageI18nKey} />
    </Alert>
  )
}
