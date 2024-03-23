/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import type { CommonFieldProps } from './fields'
import React, { useMemo } from 'react'
import { Form } from 'react-bootstrap'
import { Trans } from 'react-i18next'

/**
 * Renders an input field for the new password when registering.
 *
 * @param onChange Hook that is called when the entered password changes.
 * @param value The currently entered password.
 */
export const NewPasswordField: React.FC<CommonFieldProps> = ({ onChange, value, hasError = false }) => {
  const isValid = useMemo(() => value.length >= 6, [value])

  const placeholderText = useTranslatedText('login.auth.password')

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
        placeholder={placeholderText}
        autoComplete='new-password'
        required
      />
      <Form.Text>
        <Trans i18nKey='login.register.passwordInfo' />
      </Form.Text>
    </Form.Group>
  )
}
