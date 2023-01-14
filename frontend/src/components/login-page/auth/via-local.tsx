/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { doLocalLogin } from '../../../api/auth/local'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useOnInputChange } from '../../../hooks/common/use-on-input-change'
import { ShowIf } from '../../common/show-if/show-if'
import { PasswordField } from './fields/password-field'
import { UsernameField } from './fields/username-field'
import { fetchAndSetUser } from './utils'
import Link from 'next/link'
import type { FormEvent } from 'react'
import React, { useCallback, useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders the local login box with username and password field and the optional button for registering a new user.
 */
export const ViaLocal: React.FC = () => {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const allowRegister = useApplicationState((state) => state.config.allowRegister)

  const onLoginSubmit = useCallback(
    (event: FormEvent) => {
      doLocalLogin(username, password)
        .then(() => fetchAndSetUser())
        .catch((error: Error) => setError(error.message))
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
          <Trans i18nKey='login.signInVia' values={{ service: t('login.auth.username') }} />
        </Card.Title>
        <Form onSubmit={onLoginSubmit}>
          <UsernameField onChange={onUsernameChange} invalid={!!error} />
          <PasswordField onChange={onPasswordChange} invalid={!!error} />
          <Alert className='small' show={!!error} variant='danger'>
            <Trans i18nKey={error} />
          </Alert>

          <div className='flex flex-row' dir='auto'>
            <Button type='submit' variant='primary' className='mx-2'>
              <Trans i18nKey='login.signIn' />
            </Button>
            <ShowIf condition={allowRegister}>
              <Link href={'/register'} passHref={true}>
                <Button type='button' variant='secondary' className='mx-2'>
                  <Trans i18nKey='login.register.title' />
                </Button>
              </Link>
            </ShowIf>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}
