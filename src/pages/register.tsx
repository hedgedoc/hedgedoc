/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { FormEvent } from 'react'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Card, Col, Form, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { doLocalRegister } from '../api/auth/local'
import { useApplicationState } from '../hooks/common/use-application-state'
import { fetchAndSetUser } from '../components/login-page/auth/utils'
import { RegisterError as RegisterErrorType } from '../api/auth/types'
import { RegisterInfos } from '../components/register-page/register-infos/register-infos'
import { UsernameField } from '../components/common/fields/username-field'
import { DisplayNameField } from '../components/common/fields/display-name-field'
import { NewPasswordField } from '../components/common/fields/new-password-field'
import { PasswordAgainField } from '../components/common/fields/password-again-field'
import { useOnInputChange } from '../hooks/common/use-on-input-change'
import { RegisterError } from '../components/register-page/register-error/register-error'
import { LandingLayout } from '../components/landing-layout/landing-layout'
import { useRouter } from 'next/router'
import type { NextPage } from 'next'
import { Redirect } from '../components/common/redirect'
import { useUiNotifications } from '../components/notifications/ui-notification-boundary'

/**
 * Renders the registration page with fields for username, display name, password, password retype and information about terms and conditions.
 */
export const RegisterPage: NextPage = () => {
  useTranslation()
  const router = useRouter()
  const allowRegister = useApplicationState((state) => state.config.allowRegister)
  const userExists = useApplicationState((state) => !!state.user)

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordAgain, setPasswordAgain] = useState('')
  const [error, setError] = useState<RegisterErrorType>()

  const { dispatchUiNotification } = useUiNotifications()

  const doRegisterSubmit = useCallback(
    (event: FormEvent) => {
      doLocalRegister(username, displayName, password)
        .then(() => fetchAndSetUser())
        .then(() => dispatchUiNotification('login.register.success.title', 'login.register.success.message', {}))
        .then(() => router.push('/'))
        .catch((error: Error) => {
          setError(
            Object.values(RegisterErrorType).includes(error.message as RegisterErrorType)
              ? (error.message as RegisterErrorType)
              : RegisterErrorType.OTHER
          )
        })
      event.preventDefault()
    },
    [username, displayName, password, dispatchUiNotification, router]
  )

  const ready = useMemo(() => {
    return (
      username.trim() !== '' &&
      displayName.trim() !== '' &&
      password.trim() !== '' &&
      password.length >= 8 &&
      password === passwordAgain
    )
  }, [username, password, displayName, passwordAgain])

  const onUsernameChange = useOnInputChange(setUsername)
  const onDisplayNameChange = useOnInputChange(setDisplayName)
  const onPasswordChange = useOnInputChange(setPassword)
  const onPasswordAgainChange = useOnInputChange(setPasswordAgain)

  if (userExists) {
    return <Redirect to={'/intro'} />
  }

  if (!allowRegister) {
    return <Redirect to={'/login'} />
  }

  return (
    <LandingLayout>
      <div className='my-3'>
        <h1 className='mb-4'>
          <Trans i18nKey='login.register.title' />
        </h1>
        <Row className='h-100 d-flex justify-content-center'>
          <Col lg={6}>
            <Card className='bg-dark mb-4 text-start'>
              <Card.Body>
                <Form onSubmit={doRegisterSubmit}>
                  <UsernameField onChange={onUsernameChange} value={username} />
                  <DisplayNameField onChange={onDisplayNameChange} value={displayName} />
                  <NewPasswordField onChange={onPasswordChange} value={password} />
                  <PasswordAgainField password={password} onChange={onPasswordAgainChange} value={passwordAgain} />

                  <RegisterInfos />

                  <Button variant='primary' type='submit' block={true} disabled={!ready}>
                    <Trans i18nKey='login.register.title' />
                  </Button>
                </Form>

                <RegisterError error={error} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </LandingLayout>
  )
}

export default RegisterPage
