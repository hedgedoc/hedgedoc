'use client'
/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import type { ApiError } from '../../../../api/common/api-error'
import { doLocalRegister } from '../../../../api/auth/local'
import { useLowercaseOnInputChange } from '../../../../hooks/common/use-lowercase-on-input-change'
import { useOnInputChange } from '../../../../hooks/common/use-on-input-change'
import { UsernameLabelField } from '../../../common/fields/username-label-field'
import { DisplayNameField } from '../../../common/fields/display-name-field'
import { NewPasswordField } from '../../../common/fields/new-password-field'
import { PasswordAgainField } from '../../../common/fields/password-again-field'
import { RegisterInfos } from './register-infos'
import { RegisterError } from './register-error'
import { fetchAndSetUser } from '../../utils/fetch-and-set-user'
import { useGetPostLoginRedirectUrl } from '../../utils/use-get-post-login-redirect-url'

/**
 * Renders the registration process with fields for username, display name, password, password retype and information about terms and conditions.
 */
export const LocalRegisterForm: NextPage = () => {
  useTranslation()
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordAgain, setPasswordAgain] = useState('')
  const [error, setError] = useState<ApiError>()

  const { dispatchUiNotification } = useUiNotifications()
  const postLoginRedirectUrl = useGetPostLoginRedirectUrl()

  const doRegisterSubmit = useCallback(
    (event: FormEvent) => {
      doLocalRegister(username, displayName, password)
        .then(() => fetchAndSetUser())
        .then(() => dispatchUiNotification('login.register.success.title', 'login.register.success.message', {}))
        .then(() => router.push(postLoginRedirectUrl))
        .catch((error: ApiError) => setError(error))
      event.preventDefault()
    },
    [username, displayName, password, dispatchUiNotification, router, postLoginRedirectUrl]
  )

  const ready = useMemo(() => {
    return (
      username.length >= 3 &&
      username.length <= 64 &&
      displayName.trim() !== '' &&
      password.length >= 6 &&
      password === passwordAgain
    )
  }, [username, password, displayName, passwordAgain])

  const isWeakPassword = useMemo(() => {
    return error?.backendErrorName === 'PasswordTooWeakError'
  }, [error])

  const onUsernameChange = useLowercaseOnInputChange(setUsername)
  const onDisplayNameChange = useOnInputChange(setDisplayName)
  const onPasswordChange = useOnInputChange(setPassword)
  const onPasswordAgainChange = useOnInputChange(setPasswordAgain)

  return (
    <Form onSubmit={doRegisterSubmit} className={'d-flex flex-column gap-3'}>
      <UsernameLabelField onChange={onUsernameChange} value={username} />
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
  )
}
