/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorToI18nKeyMapper } from '../../../../api/common/error-to-i18n-key-mapper'
import React, { useMemo } from 'react'
import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { RateLimitError } from '../../../../api/common/api-error'

interface RegisterErrorProps {
  error?: Error
}

export const RegisterError: React.FC<RegisterErrorProps> = ({ error }) => {
  const { t } = useTranslation()

  const errorMessage = useMemo(() => {
    if (!error) {
      return null
    }
    if (error instanceof RateLimitError) {
      return t('errors.rateLimitExceeded.description', {
        resetIn: error.getResetIn()
      })
    }
    const i18nKey = new ErrorToI18nKeyMapper(error, 'login.register.error')
      .withHttpCode(409, 'usernameExisting')
      .withBackendErrorName('FeatureDisabledError', 'registrationDisabled')
      .withBackendErrorName('PasswordTooWeakError', 'passwordTooWeak')
      .orFallbackI18nKey('other')
    return t(i18nKey)
  }, [error, t])

  return (
    <Alert className='small' show={!!errorMessage} variant='danger'>
      {errorMessage}
    </Alert>
  )
}
