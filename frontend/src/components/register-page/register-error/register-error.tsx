/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RegisterError as RegisterErrorType } from '../../../api/auth/types'
import React, { useMemo } from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

export interface RegisterErrorProps {
  error?: RegisterErrorType
}

/**
 * Renders an error message for registration fields when an error is present.
 *
 * @param error The error to render. Can be {@link undefined} when no error should be rendered.
 */
export const RegisterError: React.FC<RegisterErrorProps> = ({ error }) => {
  useTranslation()

  const errorMessageI18nKey = useMemo(() => {
    switch (error) {
      case RegisterErrorType.PASSWORD_TOO_WEAK:
        return 'login.register.error.passwordTooWeak'
      case RegisterErrorType.REGISTRATION_DISABLED:
        return 'login.register.error.registrationDisabled'
      case RegisterErrorType.USERNAME_EXISTING:
        return 'login.register.error.usernameExisting'
      default:
        return 'login.register.error.other'
    }
  }, [error])

  return (
    <Alert className='small' show={!!error} variant='danger'>
      <Trans i18nKey={errorMessageI18nKey} />
    </Alert>
  )
}
