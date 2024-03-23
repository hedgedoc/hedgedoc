/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { doLocalLogin } from '../../../api/auth/local'
import { ErrorToI18nKeyMapper } from '../../../api/common/error-to-i18n-key-mapper'
import { useLowercaseOnInputChange } from '../../../hooks/common/use-lowercase-on-input-change'
import { useOnInputChange } from '../../../hooks/common/use-on-input-change'
import { UsernameField } from '../../common/fields/username-field'
import type { FormEvent } from 'react'
import React, { useCallback, useMemo, useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { fetchAndSetUser } from '../utils/fetch-and-set-user'
import { PasswordField } from '../password-field'

/**
 * Renders the local login box with username and password field and the optional button for registering a new user.
 */
export const LocalLoginCardBody: React.FC = () => {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  const onLoginSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      doLocalLogin(username, password)
        .then(() => fetchAndSetUser())
        .catch((error: Error) => {
          const errorI18nKey = new ErrorToI18nKeyMapper(error, 'login.auth.error')
            .withHttpCode(404, 'usernamePassword')
            .withHttpCode(401, 'usernamePassword')
            .withBackendErrorName('FeatureDisabledError', 'loginDisabled')
            .orFallbackI18nKey('other')
          setError(errorI18nKey)
        })
    },
    [username, password]
  )

  const onUsernameChange = useLowercaseOnInputChange(setUsername)
  const onPasswordChange = useOnInputChange(setPassword)

  const translationOptions = useMemo(() => ({ service: t('login.auth.username') }), [t])

  return (
    <Card.Body>
      <Card.Title>
        <Trans i18nKey='login.signInVia' values={translationOptions} />
      </Card.Title>
      <Form onSubmit={onLoginSubmit} className={'d-flex gap-3 flex-column'}>
        <UsernameField onChange={onUsernameChange} isInvalid={!!error} value={username} />
        <PasswordField onChange={onPasswordChange} isInvalid={!!error} />
        <Alert className='small' show={!!error} variant='danger'>
          <Trans i18nKey={error} />
        </Alert>
        <Button type='submit' variant='primary'>
          <Trans i18nKey='login.signIn' />
        </Button>
      </Form>
    </Card.Body>
  )
}
