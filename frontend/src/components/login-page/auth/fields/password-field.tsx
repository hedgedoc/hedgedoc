/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../../hooks/common/use-translated-text'
import type { AuthFieldProps } from './fields'
import React from 'react'
import { Form } from 'react-bootstrap'

/**
 * Renders an input field for the password of a user.
 *
 * @param onChange Hook that is called when the entered password changes.
 * @param invalid True when the entered password is invalid, false otherwise.
 */
export const PasswordField: React.FC<AuthFieldProps> = ({ onChange, invalid }) => {
  const placeholderText = useTranslatedText('login.auth.password')

  return (
    <Form.Group>
      <Form.Control
        isInvalid={invalid}
        type='password'
        size='sm'
        placeholder={placeholderText}
        onChange={onChange}
        autoComplete='current-password'
      />
    </Form.Group>
  )
}
