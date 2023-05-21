/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AuthFieldProps } from './fields'
import React from 'react'
import { Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export interface UsernameFieldProps extends AuthFieldProps {
  value: string
}

//TODO: This should be replaced with the common username component. See https://github.com/hedgedoc/hedgedoc/issues/4128
/**
 * Renders an input field for a username.
 *
 * @param onChange Hook that is called when the input is changed.
 * @param invalid True indicates that the username is invalid, false otherwise.
 * @param value the username value
 */
export const UsernameField: React.FC<UsernameFieldProps> = ({ onChange, invalid, value }) => {
  const { t } = useTranslation()

  return (
    <Form.Group>
      <Form.Control
        isInvalid={invalid}
        value={value}
        type='text'
        size='sm'
        placeholder={t('login.auth.username') ?? undefined}
        onChange={onChange}
        className='bg-dark text-light'
        autoComplete='username'
      />
    </Form.Group>
  )
}
