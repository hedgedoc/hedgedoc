/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CommonFieldProps } from './fields'
import React, { useMemo } from 'react'
import { Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders an input field for the new password when registering.
 *
 * @param onChange Hook that is called when the entered password changes.
 * @param value The currently entered password.
 */
export const NewPasswordField: React.FC<CommonFieldProps> = ({ onChange, value, hasError = false }) => {
  const { t } = useTranslation()

  const isValid = useMemo(() => {
    return value.trim() !== ''
  }, [value])

  return (
    <Form.Group>
      <Form.Label>
        <Trans i18nKey='profile.changePassword.new' />
      </Form.Label>
      <Form.Control
        type='password'
        size='sm'
        isValid={isValid}
        isInvalid={hasError}
        onChange={onChange}
        placeholder={t('login.auth.password') ?? undefined}
        autoComplete='new-password'
        required
      />
      <Form.Text>
        <Trans i18nKey='login.register.passwordInfo' />
      </Form.Text>
    </Form.Group>
  )
}
