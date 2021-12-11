/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { FormEvent } from 'react'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'

import { Trans, useTranslation } from 'react-i18next'
import { doLdapLogin } from '../../../api/auth/ldap'
import { fetchAndSetUser } from './utils'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { AuthError as AuthErrorType } from '../../../api/auth'
import { UsernameField } from './fields/username-field'
import { PasswordField } from './fields/password-field'
import { AuthError } from './auth-error/auth-error'
import { useOnInputChange } from '../../../hooks/common/use-on-input-change'

/**
 * Renders the LDAP login box with username and password field.
 */
export const ViaLdap: React.FC = () => {
  useTranslation()
  const ldapCustomName = useApplicationState((state) => state.config.customAuthNames.ldap)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<AuthErrorType>()

  const name = useMemo(() => {
    return ldapCustomName ? `${ldapCustomName} (LDAP)` : 'LDAP'
  }, [ldapCustomName])

  const onLoginSubmit = useCallback(
    (event: FormEvent) => {
      doLdapLogin(username, password)
        .then(() => fetchAndSetUser())
        .catch((error: Error) => {
          setError(
            Object.values(AuthErrorType).includes(error.message as AuthErrorType)
              ? (error.message as AuthErrorType)
              : AuthErrorType.OTHER
          )
        })
      event.preventDefault()
    },
    [username, password]
  )

  const onUsernameChange = useOnInputChange(setUsername)
  const onPasswordChange = useOnInputChange(setPassword)

  return (
    <Card className='bg-dark mb-4'>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='login.signInVia' values={{ service: name }} />
        </Card.Title>
        <Form onSubmit={onLoginSubmit}>
          <UsernameField onChange={onUsernameChange} invalid={!!error} />
          <PasswordField onChange={onPasswordChange} invalid={!!error} />
          <AuthError error={error} />

          <Button type='submit' variant='primary'>
            <Trans i18nKey='login.signIn' />
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
