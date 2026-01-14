/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import equal from 'fast-deep-equal'
import { useRouter } from 'next/navigation'
import React, { type FormEvent, useCallback, useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { fetchAndSetUser } from './utils/fetch-and-set-user'
import { useOnInputChange } from '../../hooks/common/use-on-input-change'
import { useLowercaseOnInputChange } from '../../hooks/common/use-lowercase-on-input-change'
import { UsernameField } from '../common/fields/username-field'
import { PasswordField } from './password-field'
import { Alert, Card, Form } from 'react-bootstrap'
import { ActionButton } from '../common/action-button'

export interface UsernamePasswordLoginProps {
  authProviderIdentifier?: string
  providerName?: string
  lowercaseUsername: boolean
  errorMapping: (rawError: Error) => string | null
  doLogin: (username: string, password: string, authProviderIdentifier?: string) => Promise<{ newUser?: boolean }>
}

/**
 * Shows the common login form for username and password login methods.
 *
 * @param authProviderIdentifier The identifier of the auth provider, in case this is required for the login method.
 * @param providerName The display name of the authentication provider.
 * @param doLogin Function that performs the login with username, password, and optional auth provider identifier.
 * @param lowercaseUsername Whether to automatically convert the username input to lowercase.
 * @param errorMapping Function that maps raw errors to user-friendly error messages.
 */
export const UsernamePasswordLogin: React.FC<UsernamePasswordLoginProps> = ({
  authProviderIdentifier,
  providerName,
  doLogin,
  lowercaseUsername,
  errorMapping
}) => {
  const { t } = useTranslation()

  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const lastUsernamePassword = useRef<[string, string]>(['', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loginName = useMemo(() => {
    if (providerName) {
      return providerName
    }
    return t('login.auth.username')
  }, [t, providerName])

  const showFieldsAsInvalid = useMemo(() => {
    if (error === null) {
      return false
    }
    return equal(lastUsernamePassword.current, [username, password])
  }, [error, username, password])

  const onLoginSubmit = useCallback(
    (event: FormEvent) => {
      let redirect = false
      setError(null)
      setLoading(true)
      lastUsernamePassword.current = [username, password]
      doLogin(username, password, authProviderIdentifier)
        .then((response) => {
          if (response.newUser) {
            router.push('/new-user')
          } else {
            redirect = true
            return fetchAndSetUser()
          }
        })
        .then(() => {
          if (redirect) {
            router.push('/')
          }
        })
        .catch((error: Error) => setError(errorMapping(error)))
        .finally(() => setLoading(false))
      event.preventDefault()
    },
    [username, password, authProviderIdentifier, router, doLogin, errorMapping]
  )

  const onUsernameChange = lowercaseUsername ? useLowercaseOnInputChange(setUsername) : useOnInputChange(setUsername)
  const onPasswordChange = useOnInputChange(setPassword)

  return (
    <Card>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='login.signInVia' values={{ service: loginName }} />
        </Card.Title>
        <Form onSubmit={onLoginSubmit} className={'d-flex gap-3 flex-column'}>
          <UsernameField onChange={onUsernameChange} isInvalid={showFieldsAsInvalid} value={username} />
          <PasswordField onChange={onPasswordChange} isInvalid={showFieldsAsInvalid} />
          <Alert className='small' show={error !== null} variant='danger'>
            {error}
          </Alert>
          <ActionButton type='submit' variant='primary' loading={loading}>
            <Trans i18nKey='login.signIn' />
          </ActionButton>
        </Form>
      </Card.Body>
    </Card>
  )
}
