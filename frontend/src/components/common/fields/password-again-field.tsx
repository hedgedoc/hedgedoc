/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CommonFieldProps } from './fields'
import React, { useMemo } from 'react'
import { Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

interface PasswordAgainFieldProps extends CommonFieldProps {
  password: string
}

/**
 * Renders an input field for typing the new password again when registering.
 *
 * @param onChange Hook that is called when the entered retype of the password changes.
 * @param value The currently entered retype of the password.
 * @param password The password entered into the password input field.
 */
export const PasswordAgainField: React.FC<PasswordAgainFieldProps> = ({
  onChange,
  value,
  password,
  hasError = false
}) => {
  const { t } = useTranslation()

  const isInvalid = useMemo(() => {
    return value !== '' && password !== value && hasError
  }, [password, value, hasError])

  const isValid = useMemo(() => {
    return password !== '' && password === value && !hasError
  }, [password, value, hasError])

  return (
    <Form.Group>
      <Form.Label>
        <Trans i18nKey='login.register.passwordAgain' />
      </Form.Label>
      <Form.Control
        type='password'
        size='sm'
        isInvalid={isInvalid}
        isValid={isValid}
        onChange={onChange}
        placeholder={t('login.register.passwordAgain') ?? undefined}
        autoComplete='new-password'
        required
      />
    </Form.Group>
  )
}
