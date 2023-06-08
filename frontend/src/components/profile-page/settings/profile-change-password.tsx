/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { doLocalPasswordChange } from '../../../api/auth/local'
import { ErrorToI18nKeyMapper } from '../../../api/common/error-to-i18n-key-mapper'
import { useOnInputChange } from '../../../hooks/common/use-on-input-change'
import { CurrentPasswordField } from '../../common/fields/current-password-field'
import { NewPasswordField } from '../../common/fields/new-password-field'
import { PasswordAgainField } from '../../common/fields/password-again-field'
import type { FormEvent } from 'react'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'

/**
 * Profile page section for changing the password when using internal login.
 */
export const ProfileChangePassword: React.FC = () => {
  useTranslation()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordAgain, setNewPasswordAgain] = useState('')

  const formRef = useRef<HTMLFormElement>(null)

  const onChangeOldPassword = useOnInputChange(setOldPassword)
  const onChangeNewPassword = useOnInputChange(setNewPassword)
  const onChangeNewPasswordAgain = useOnInputChange(setNewPasswordAgain)

  const [{ error, loading, value: changeSucceeded }, doRequest] = useAsyncFn(async (): Promise<boolean> => {
    try {
      await doLocalPasswordChange(oldPassword, newPassword)
      return true
    } catch (error) {
      const foundI18nKey = new ErrorToI18nKeyMapper(error as Error, 'login.auth.error')
        .withHttpCode(401, 'usernamePassword')
        .withBackendErrorName('FeatureDisabledError', 'loginDisabled')
        .withBackendErrorName('PasswordTooWeakError', 'login.register.error.passwordTooWeak', true)
        .orFallbackI18nKey('other')
      return Promise.reject(new Error(foundI18nKey))
    } finally {
      if (formRef.current) {
        formRef.current.reset()
      }
      setOldPassword('')
      setNewPassword('')
      setNewPasswordAgain('')
    }
  }, [oldPassword, newPassword])

  const onSubmitPasswordChange = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      void doRequest()
    },
    [doRequest]
  )

  const ready = useMemo(() => {
    return (
      !loading &&
      oldPassword.trim() !== '' &&
      newPassword.trim() !== '' &&
      newPasswordAgain.trim() !== '' &&
      newPassword === newPasswordAgain
    )
  }, [loading, oldPassword, newPassword, newPasswordAgain])

  return (
    <Card className='mb-4'>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='profile.changePassword.title' />
        </Card.Title>
        <Form onSubmit={onSubmitPasswordChange} className='text-left' ref={formRef}>
          <CurrentPasswordField onChange={onChangeOldPassword} value={oldPassword} />
          <NewPasswordField onChange={onChangeNewPassword} value={newPassword} />
          <PasswordAgainField password={newPassword} onChange={onChangeNewPasswordAgain} value={newPasswordAgain} />
          <Alert className='small my-3' show={!!error && !loading} variant={'danger'}>
            <Trans i18nKey={error?.message} />
          </Alert>
          <Alert className='small my-3' show={!error && !loading && Boolean(changeSucceeded)} variant={'success'}>
            <Trans i18nKey={'profile.changePassword.successText'} />
          </Alert>
          <Button type='submit' variant='primary' disabled={!ready} className={'mt-3'}>
            <Trans i18nKey='common.save' />
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
