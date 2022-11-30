/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { doLocalPasswordChange } from '../../../api/auth/local'
import { useOnInputChange } from '../../../hooks/common/use-on-input-change'
import { CurrentPasswordField } from '../../common/fields/current-password-field'
import { NewPasswordField } from '../../common/fields/new-password-field'
import { PasswordAgainField } from '../../common/fields/password-again-field'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import type { FormEvent } from 'react'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Profile page section for changing the password when using internal login.
 */
export const ProfileChangePassword: React.FC = () => {
  useTranslation()
  const { showErrorNotification, dispatchUiNotification } = useUiNotifications()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordAgain, setNewPasswordAgain] = useState('')

  const formRef = useRef<HTMLFormElement>(null)

  const onChangeOldPassword = useOnInputChange(setOldPassword)
  const onChangeNewPassword = useOnInputChange(setNewPassword)
  const onChangeNewPasswordAgain = useOnInputChange(setNewPasswordAgain)

  const onSubmitPasswordChange = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      doLocalPasswordChange(oldPassword, newPassword)
        .then(() =>
          dispatchUiNotification('profile.changePassword.successTitle', 'profile.changePassword.successText', {
            icon: 'check'
          })
        )
        .catch(showErrorNotification('profile.changePassword.failed'))
        .finally(() => {
          if (formRef.current) {
            formRef.current.reset()
          }
          setOldPassword('')
          setNewPassword('')
          setNewPasswordAgain('')
        })
    },
    [oldPassword, newPassword, showErrorNotification, dispatchUiNotification]
  )

  const ready = useMemo(() => {
    return (
      oldPassword.trim() !== '' &&
      newPassword.trim() !== '' &&
      newPasswordAgain.trim() !== '' &&
      newPassword === newPasswordAgain
    )
  }, [oldPassword, newPassword, newPasswordAgain])

  return (
    <Card className='bg-dark mb-4'>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='profile.changePassword.title' />
        </Card.Title>
        <Form onSubmit={onSubmitPasswordChange} className='text-left' ref={formRef}>
          <CurrentPasswordField onChange={onChangeOldPassword} value={oldPassword} />
          <NewPasswordField onChange={onChangeNewPassword} value={newPassword} />
          <PasswordAgainField password={newPassword} onChange={onChangeNewPasswordAgain} value={newPasswordAgain} />

          <Button type='submit' variant='primary' disabled={!ready}>
            <Trans i18nKey='common.save' />
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
