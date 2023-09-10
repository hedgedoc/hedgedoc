/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { doLdapLogin } from '../../../api/auth/ldap'
import { useLowercaseOnInputChange } from '../../../hooks/common/use-lowercase-on-input-change'
import { useOnInputChange } from '../../../hooks/common/use-on-input-change'
import { UsernameField } from '../../common/fields/username-field'
import type { FormEvent } from 'react'
import React, { useCallback, useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { fetchAndSetUser } from '../utils/fetch-and-set-user'
import { PasswordField } from '../password-field'

export interface ViaLdapProps {
  providerName: string
  identifier: string
}

/**
 * Renders the LDAP login box with username and password field.
 */
export const LdapLoginCard: React.FC<ViaLdapProps> = ({ providerName, identifier }) => {
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
    <Card>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='login.signInVia' values={{ service: providerName }} />
        </Card.Title>
        <Form onSubmit={onLoginSubmit} className={'d-flex gap-3 flex-column'}>
          <UsernameField onChange={onUsernameChange} isValid={!!error} value={username} />
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
