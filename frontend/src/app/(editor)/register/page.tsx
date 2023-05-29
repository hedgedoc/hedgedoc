'use client'
/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { doLocalRegister } from '../../../api/auth/local'
import type { ApiError } from '../../../api/common/api-error'
import { DisplayNameField } from '../../../components/common/fields/display-name-field'
import { NewPasswordField } from '../../../components/common/fields/new-password-field'
import { PasswordAgainField } from '../../../components/common/fields/password-again-field'
import { UsernameLabelField } from '../../../components/common/fields/username-label-field'
import { useFrontendConfig } from '../../../components/common/frontend-config-context/use-frontend-config'
import { Redirect } from '../../../components/common/redirect'
import { LandingLayout } from '../../../components/landing-layout/landing-layout'
import { fetchAndSetUser } from '../../../components/login-page/auth/utils'
import { useUiNotifications } from '../../../components/notifications/ui-notification-boundary'
import { RegisterError } from '../../../components/register-page/register-error'
import { RegisterInfos } from '../../../components/register-page/register-infos'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useLowercaseOnInputChange } from '../../../hooks/common/use-lowercase-on-input-change'
import { useOnInputChange } from '../../../hooks/common/use-on-input-change'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Card, Col, Form, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders the registration page with fields for username, display name, password, password retype and information about terms and conditions.
 */
const RegisterPage: NextPage = () => {
  useTranslation()
  const router = useRouter()
  const allowRegister = useFrontendConfig().allowRegister
  const userExists = useApplicationState((state) => !!state.user)

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordAgain, setPasswordAgain] = useState('')
  const [error, setError] = useState<ApiError>()

  const { dispatchUiNotification } = useUiNotifications()

  const doRegisterSubmit = useCallback(
    (event: FormEvent) => {
      doLocalRegister(username, displayName, password)
        .then(() => fetchAndSetUser())
        .then(() => dispatchUiNotification('login.register.success.title', 'login.register.success.message', {}))
        .then(() => router.push('/'))
        .catch((error: ApiError) => setError(error))
      event.preventDefault()
    },
    [username, displayName, password, dispatchUiNotification, router]
  )

  const ready = useMemo(() => {
    return username.trim() !== '' && displayName.trim() !== '' && password.trim() !== '' && password === passwordAgain
  }, [username, password, displayName, passwordAgain])

  const isWeakPassword = useMemo(() => {
    return error?.backendErrorName === 'PasswordTooWeakError'
  }, [error])

  const isValidUsername = useMemo(() => Boolean(username.trim()), [username])

  const onUsernameChange = useLowercaseOnInputChange(setUsername)
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
            <Card className='mb-4 text-start'>
              <Card.Body>
                <Form onSubmit={doRegisterSubmit} className={'d-flex flex-column gap-3'}>
                  <UsernameLabelField onChange={onUsernameChange} value={username} isValid={isValidUsername} />
                  <DisplayNameField onChange={onDisplayNameChange} value={displayName} />
                  <NewPasswordField onChange={onPasswordChange} value={password} hasError={isWeakPassword} />
                  <PasswordAgainField
                    password={password}
                    onChange={onPasswordAgainChange}
                    value={passwordAgain}
                    hasError={isWeakPassword}
                  />

                  <RegisterInfos />

                  <Button variant='primary' type='submit' disabled={!ready}>
                    <Trans i18nKey='login.register.title' />
                  </Button>

                  <RegisterError error={error} />
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </LandingLayout>
  )
}

export default RegisterPage
