/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AuthFieldProps } from './fields'
import React from 'react'
import { Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

/**
 * Renders an input field for the password of a user.
 *
 * @param onChange Hook that is called when the entered password changes.
 * @param invalid True when the entered password is invalid, false otherwise.
 */
export const PasswordField: React.FC<AuthFieldProps> = ({ onChange, invalid }) => {
  const { t } = useTranslation()

  return (
    <Form.Group>
      <Form.Control
        isInvalid={invalid}
        type='password'
        size='sm'
        placeholder={t('login.auth.password') ?? undefined}
        onChange={onChange}
        autoComplete='current-password'
      />
    </Form.Group>
  )
}
