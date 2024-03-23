/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorToI18nKeyMapper } from '../../../../api/common/error-to-i18n-key-mapper'
import React, { useMemo } from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

interface RegisterErrorProps {
  error?: Error
}

export const RegisterError: React.FC<RegisterErrorProps> = ({ error }) => {
  useTranslation()

  const errorI18nKey = useMemo(() => {
    if (!error) {
      return null
    }
    return new ErrorToI18nKeyMapper(error, 'login.register.error')
      .withHttpCode(409, 'usernameExisting')
      .withBackendErrorName('FeatureDisabledError', 'registrationDisabled')
      .withBackendErrorName('PasswordTooWeakError', 'passwordTooWeak')
      .orFallbackI18nKey('other')
  }, [error])

  return (
    <Alert className='small' show={!!errorI18nKey} variant='danger'>
      <Trans i18nKey={errorI18nKey ?? ''} />
    </Alert>
  )
}
