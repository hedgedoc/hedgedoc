/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { doLdapLogin } from '../../../api/auth/ldap'
import { useLowercaseOnInputChange } from '../../../hooks/common/use-lowercase-on-input-change'
import { useOnInputChange } from '../../../hooks/common/use-on-input-change'
import { PasswordField } from './fields/password-field'
import { UsernameField } from './fields/username-field'
import { fetchAndSetUser } from './utils'
import type { FormEvent } from 'react'
import React, { useCallback, useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

export interface ViaLdapProps {
  providerName: string
  identifier: string
}

/**
 * Renders the LDAP login box with username and password field.
 */
export const ViaLdap: React.FC<ViaLdapProps> = ({ providerName, identifier }) => {
  useTranslation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  const onLoginSubmit = useCallback(
    (event: FormEvent) => {
      doLdapLogin(identifier, username, password)
        .then(() => fetchAndSetUser())
        .catch((error: Error) => setError(error.message))
      event.preventDefault()
    },
    [username, password, identifier]
  )

  const onUsernameChange = useLowercaseOnInputChange(setUsername)
  const onPasswordChange = useOnInputChange(setPassword)

  return (
    <Card className='bg-dark mb-4'>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='login.signInVia' values={{ service: providerName }} />
        </Card.Title>
        <Form onSubmit={onLoginSubmit}>
          <UsernameField onChange={onUsernameChange} invalid={!!error} value={username} />
          <PasswordField onChange={onPasswordChange} invalid={!!error} />
          <Alert className='small' show={!!error} variant='danger'>
            <Trans i18nKey={error} />
          </Alert>

          <Button type='submit' variant='primary'>
            <Trans i18nKey='login.signIn' />
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
