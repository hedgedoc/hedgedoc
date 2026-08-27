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
import { Alert, Button, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { MIN_PASSWORD_LENGTH } from '@hedgedoc/commons'
import { useFrontendConfig } from '../../common/frontend-config-context/use-frontend-config'

/**
 * Form for changing the password of a local identity.
 */
export const ProfileChangePassword: React.FC = () => {
  useTranslation()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordAgain, setNewPasswordAgain] = useState('')
  const { allowProfileEdits } = useFrontendConfig()

  const formRef = useRef<HTMLFormElement>(null)

  const onChangeOldPassword = useOnInputChange(setOldPassword)
  const onChangeNewPassword = useOnInputChange(setNewPassword)
  const onChangeNewPasswordAgain = useOnInputChange(setNewPasswordAgain)

  const [{ error, loading, value: changeSucceeded }, doRequest] = useAsyncFn(async (): Promise<boolean> => {
    try {
      await doLocalPasswordChange(oldPassword, newPassword)
      return true
    } catch (error) {
      const foundI18nKey = new ErrorToI18nKeyMapper(error as Error, 'profile.changePassword.error')
        .withHttpCode(401, 'wrongPassword')
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
      !loading && oldPassword !== '' && newPassword.length >= MIN_PASSWORD_LENGTH && newPassword === newPasswordAgain
    )
  }, [loading, oldPassword, newPassword, newPasswordAgain])

  return (
    <fieldset className='border rounded p-3 mb-3'>
      <legend className='float-none w-auto px-2 fs-6'>
        <Trans i18nKey='profile.changePassword.title' />
      </legend>
      <Form onSubmit={onSubmitPasswordChange} className='text-start' ref={formRef}>
        <CurrentPasswordField onChange={onChangeOldPassword} value={oldPassword} disabled={!allowProfileEdits} />
        <NewPasswordField onChange={onChangeNewPassword} value={newPassword} disabled={!allowProfileEdits} />
        <PasswordAgainField
          password={newPassword}
          onChange={onChangeNewPasswordAgain}
          value={newPasswordAgain}
          disabled={!allowProfileEdits}
        />
        <Alert className='small my-3' show={!!error && !loading} variant={'danger'}>
          <Trans i18nKey={error?.message} />
        </Alert>
        <Alert className='small my-3' show={!error && !loading && Boolean(changeSucceeded)} variant={'success'}>
          <Trans i18nKey={'profile.changePassword.successText'} />
        </Alert>
        <Button type='submit' variant='primary' disabled={!allowProfileEdits || !ready} className={'mt-3'}>
          <Trans i18nKey='common.save' />
        </Button>
      </Form>
    </fieldset>
  )
}
