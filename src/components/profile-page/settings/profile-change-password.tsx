/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { FormEvent } from 'react'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { doLocalPasswordChange } from '../../../api/auth/local'
import { showErrorNotification } from '../../../redux/ui-notifications/methods'
import { useOnInputChange } from '../../../hooks/common/use-on-input-change'
import { NewPasswordField } from '../../common/fields/new-password-field'
import { PasswordAgainField } from '../../common/fields/password-again-field'
import { CurrentPasswordField } from '../../common/fields/current-password-field'

/**
 * Profile page section for changing the password when using internal login.
 */
export const ProfileChangePassword: React.FC = () => {
  useTranslation()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordAgain, setNewPasswordAgain] = useState('')

  const onChangeOldPassword = useOnInputChange(setOldPassword)
  const onChangeNewPassword = useOnInputChange(setNewPassword)
  const onChangeNewPasswordAgain = useOnInputChange(setNewPasswordAgain)

  const onSubmitPasswordChange = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      doLocalPasswordChange(oldPassword, newPassword).catch(showErrorNotification('profile.changePassword.failed'))
    },
    [oldPassword, newPassword]
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
        <Form onSubmit={onSubmitPasswordChange} className='text-left'>
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
